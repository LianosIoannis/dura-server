/** biome-ignore-all lint/style/useImportType: <nest> */
import fs, { readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import iconv from "iconv-lite";
import { BreakLine, CharacterSet, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import puppeteer from "puppeteer";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import {
	buildDeviceSummary,
	footer,
	formatReceiptAmount,
	formatReceiptDate,
	header,
	normalizeReceiptText,
	receiptLogoPath,
	receiptNotice,
	receiptTitle,
} from "./receipt/receiptData";

type ReceiptOrder = {
	id: number;
	problem: string;
	intakeNotes: string | null;
	technicianNotes: string | null;
	deviceType: string | null;
	deviceBrand: string | null;
	deviceModel: string | null;
	serialNumber: string | null;
	estimate: number | null;
	finalTotal: number | null;
	createdAt: Date;
	customer: {
		name: string;
		phone: string | null;
	};
};

type ReceiptSection = {
	title: string;
	value: string;
};

type ReceiptContent = {
	headerLines: string[];
	footerLines: string[];
	title: string;
	notice: string;
	orderNumber: string;
	createdAt: string;
	price: string;
	sections: ReceiptSection[];
};

@Injectable()
export class OrderService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {}

	async create(createOrderDto: CreateOrderDto) {
		const existingCustomer = await this.prisma.customer.findUnique({
			where: { id: createOrderDto.customerId },
		});

		if (!existingCustomer) {
			throw new NotFoundException(`Customer with id ${createOrderDto.customerId} not found`);
		}

		return await this.prisma.order.create({
			data: createOrderDto,
			include: { customer: true },
		});
	}

	async getById(id: number) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: {
				customer: true,
			},
		});

		if (!order) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}

		return order;
	}

	async printOrder(id: number) {
		const printerIp = this.config.getOrThrow<string>("PRINTER_IP");
		const printerPort = this.config.getOrThrow<number>("PRINTER_PORT");
		const printerType = PrinterTypes[this.config.getOrThrow<string>("PRINTER_TYPE") as keyof typeof PrinterTypes];
		const order = await this.findOrderForReceipt(id);
		const receiptContent = this.buildReceiptContent(order);

		const printer = new ThermalPrinter({
			type: printerType,
			interface: `tcp://${printerIp}:${printerPort}`,
			width: 42,
			characterSet: CharacterSet.PC737_GREEK,
			breakLine: BreakLine.WORD,
			removeSpecialCharacters: false,
			lineCharacter: "-",
		});

		const p = printer as any;

		p.printer.config.CODE_PAGE_PC737_GREEK = Buffer.from([0x1b, 0x74, 64]);
		p.printer.config.CODE_PAGES.PC737_GREEK = "CP737";

		// Re-apply charset with correct mapping
		printer.clear();

		// (optional debug - remove later)
		const cmd = p.printer.config[`CODE_PAGE_${p.config.codePage}`];
		console.log("ESC t value:", cmd?.[2]);

		const isConnected = await printer.isPrinterConnected();

		if (!isConnected) {
			throw new Error("Unable to connect to the printer");
		}

		printer.clear();
		printer.alignCenter();
		printer.setTypeFontB();
		printer.setLineSpacing(24);

		try {
			await printer.printImage(receiptLogoPath);
			printer.newLine();
		} catch (error) {
			console.warn("Receipt logo could not be printed.", error);
		}

		for (const line of receiptContent.headerLines) {
			printer.println(line);
		}

		printer.newLine();
		printer.bold(true);
		printer.println(receiptContent.title);
		printer.bold(false);
		printer.println(receiptContent.orderNumber);
		printer.println(receiptContent.notice);
		printer.println(receiptContent.createdAt);
		printer.drawLine();

		printer.alignLeft();
		for (const section of receiptContent.sections) {
			printSection(printer, section.title, section.value);
		}

		printer.drawLine();
		printer.bold(true);
		printer.println("ΤΙΜΗ");
		printer.bold(false);
		printer.alignRight();
		printer.setTextDoubleWidth();
		printer.println(receiptContent.price);
		printer.setTextNormal();
		printer.alignLeft();
		printer.newLine();

		for (const line of receiptContent.footerLines) {
			printer.println(line);
		}

		printer.resetLineSpacing();
		printer.newLine();
		printer.alignCenter();
		printer.println("Powered By: Dura Repairs");
		printer.cut();
		await printer.execute();

		return order;
	}

	async testGreekRaw() {
		async function sendRaw(printerIp: string, printerPort: number, buffer: Buffer): Promise<void> {
			return new Promise((resolve, reject) => {
				const socket = net.createConnection(printerPort, printerIp, () => {
					socket.write(buffer);
					socket.end();
				});

				socket.on("close", () => resolve());
				socket.on("error", reject);
			});
		}

		const printerIp = this.config.getOrThrow<string>("PRINTER_IP");
		const printerPort = this.config.getOrThrow<number>("PRINTER_PORT");

		const data = Buffer.concat([
			Buffer.from([0x1b, 0x40]), // init
			Buffer.from([0x1b, 0x74, 64]), // codepage 64
			iconv.encode("Καλημέρα Ελλάδα\n", "cp737"),
			iconv.encode("ΔΕΛΤΙΟ ΠΑΡΑΛΑΒΗΣ ΕΠΙΣΚΕΥΗΣ\n", "cp737"),
			Buffer.from("\n\n"),
			Buffer.from([0x1d, 0x56, 0x00]), // cut
		]);

		await sendRaw(printerIp, printerPort, data);

		console.log("Printed via raw TCP");
	}

	async printOrderNew(id: number) {
		const imagePath = await this.renderOrderReceiptImage(id);

		const printerIp = this.config.getOrThrow<string>("PRINTER_IP");
		const printerPort = this.config.getOrThrow<number>("PRINTER_PORT");
		const printerType = PrinterTypes[this.config.getOrThrow<string>("PRINTER_TYPE") as keyof typeof PrinterTypes];

		const printer = new ThermalPrinter({
			type: printerType,
			interface: `tcp://${printerIp}:${printerPort}`,
			width: 42,
			breakLine: BreakLine.WORD,
			removeSpecialCharacters: false,
			lineCharacter: "-",
		});

		const isConnected = await printer.isPrinterConnected();

		if (!isConnected) {
			throw new Error("Unable to connect to the printer");
		}

		printer.alignCenter();
		await printer.printImage(imagePath);
		printer.cut();

		await printer.execute();
	}

	async printOrderHtml(id: number) {
		const order = await this.findOrderForReceipt(id);
		const receiptContent = this.buildReceiptContent(order);
		const logoDataUrl = await this.getReceiptLogoDataUrl();

		return `<!DOCTYPE html>
			<html lang="el">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Receipt #${escapeHtml(String(order.id))}</title>
				<style>
					:root {
						color-scheme: light;
						font-family: "Courier New", Courier, monospace;
					}

					* {
						box-sizing: border-box;
					}

					body {
						margin: 0;
						padding: 0;
						background: white;
						color: #111;
					}

					.receipt {
						width: 384px;
						margin: 0;
						padding: 16px 14px 24px;
						background: white;
						box-shadow: none;
					}

					.center {
						text-align: center;
					}

					.logo {
						display: block;
						max-width: 150px;
						width: 100%;
						margin: 0 auto 8px;
					}

					.header-line,
					.meta-line,
					.footer-line,
					.powered-line,
					.section-value {
						white-space: pre-wrap;
						word-break: break-word;
					}

					.header-line,
					.meta-line,
					.footer-line,
					.section-label,
					.section-value,
					.powered-line {
						font-size: 12px;
						line-height: 1.35;
					}

					.title {
						font-size: 14px;
						font-weight: 700;
						margin-top: 10px;
					}

					.order-number {
						font-size: 28px;
						font-weight: 700;
						letter-spacing: 1px;
						margin: 10px 0;
					}

					.rule {
						border-top: 1px dashed #333;
						margin: 12px 0;
					}

					.section {
						margin-bottom: 10px;
					}

					.section-label {
						font-weight: 700;
						margin-bottom: 2px;
					}

					.price-label {
						font-size: 18px;
						font-weight: 700;
					}

					.price-value {
						font-size: 36px;
						line-height: 1;
						font-weight: 700;
						text-align: right;
						margin-top: 6px;
					}

					.footer {
						margin-top: 12px;
					}

					.powered {
						margin-top: 12px;
						text-align: center;
					}
				</style>
			</head>
			<body>
				<article class="receipt">
					${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="Dura Repairs" />` : ""}
					<section class="center">
						${receiptContent.headerLines.map((line) => `<div class="header-line">${escapeHtml(line)}</div>`).join("")}
						<div class="title">${escapeHtml(receiptContent.title)}</div>
						<div class="order-number">${escapeHtml(receiptContent.orderNumber)}</div>
						<div class="meta-line">${escapeHtml(receiptContent.notice)}</div>
						<div class="meta-line">${escapeHtml(receiptContent.createdAt)}</div>
					</section>
					<div class="rule"></div>
					<section>
						${receiptContent.sections
							.map(
								(section) => `<div class="section">
							<div class="section-label">${escapeHtml(section.title)}</div>
							<div class="section-value">${escapeHtml(section.value)}</div>
						</div>`,
							)
							.join("")}
					</section>
					<div class="rule"></div>
					<section>
						<div class="price-label">ΤΙΜΗ</div>
						<div class="price-value">${escapeHtml(receiptContent.price)}</div>
					</section>
					<section class="footer">
						${receiptContent.footerLines.map((line) => `<div class="footer-line">${escapeHtml(line)}</div>`).join("")}
					</section>
					<section class="powered">
						<div class="powered-line">Powered By: Dura Repairs</div>
						<div class="powered-line">https://www.durarepairs.gr/</div>
					</section>
				</article>
			</body>
			</html>`;
	}

	async renderOrderReceiptImage(id: number): Promise<string> {
		const html = await this.printOrderHtml(id);

		const outputDir = path.resolve(process.cwd(), "tmp", "receipts");
		await fs.mkdir(outputDir, { recursive: true });

		const outputPath = path.join(outputDir, `receipt-${id}.png`);

		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		try {
			const page = await browser.newPage();

			await page.setViewport({
				width: 384,
				height: 2000,
				deviceScaleFactor: 2,
			});

			await page.setContent(html, {
				waitUntil: "networkidle0",
			});

			const receiptElement = await page.$(".receipt");

			if (!receiptElement) {
				throw new Error("Receipt element not found");
			}

			await receiptElement.screenshot({
				path: outputPath,
				omitBackground: false,
			});

			return outputPath;
		} finally {
			await browser.close();
		}
	}

	async getAll() {
		return await this.prisma.order.findMany({
			include: {
				customer: true,
			},
		});
	}

	async update(id: number, updateOrderDto: UpdateOrderDto) {
		const existingOrder = await this.prisma.order.findUnique({
			where: { id },
		});

		if (!existingOrder) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}

		return await this.prisma.order.update({
			where: { id },
			data: updateOrderDto,
			include: { customer: true },
		});
	}

	async delete(id: number) {
		const existingOrder = await this.prisma.order.findUnique({
			where: { id },
		});

		if (!existingOrder) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}

		return await this.prisma.order.delete({
			where: { id },
		});
	}

	private buildReceiptContent(order: ReceiptOrder): ReceiptContent {
		const orderPrice = order.finalTotal ?? order.estimate;
		const orderText = normalizeReceiptText(order.problem);
		const intakeNotes = normalizeReceiptText(order.intakeNotes);
		const technicianNotes = normalizeReceiptText(order.technicianNotes);
		const deviceSummary = buildDeviceSummary(order);
		const sections: ReceiptSection[] = [{ title: "ΠΕΛΑΤΗΣ", value: order.customer.name }];

		if (order.customer.phone) {
			sections.push({ title: "ΤΗΛΕΦΩΝΟ", value: order.customer.phone });
		}

		if (deviceSummary) {
			sections.push({ title: "ΣΥΣΚΕΥΗ", value: deviceSummary });
		}

		if (order.serialNumber) {
			sections.push({ title: "SERIAL", value: order.serialNumber });
		}

		sections.push({ title: "ΠΕΡΙΓΡΑΦΗ ΕΠΙΣΚΕΥΗΣ", value: orderText });

		if (intakeNotes) {
			sections.push({ title: "ΣΗΜΕΙΩΣΕΙΣ ΠΑΡΑΛΑΒΗΣ", value: intakeNotes });
		}

		if (technicianNotes) {
			sections.push({ title: "ΣΗΜΕΙΩΣΕΙΣ ΤΕΧΝΙΚΟΥ", value: technicianNotes });
		}

		return {
			headerLines: header.split("\n"),
			footerLines: footer.split("\n"),
			title: receiptTitle,
			notice: receiptNotice,
			orderNumber: `#${order.id}`,
			createdAt: formatReceiptDate(order.createdAt),
			price: orderPrice != null ? formatReceiptAmount(orderPrice) : "--",
			sections,
		};
	}

	private async findOrderForReceipt(id: number): Promise<ReceiptOrder> {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: {
				customer: true,
			},
		});

		if (!order) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}

		return order;
	}

	private async getReceiptLogoDataUrl() {
		try {
			const imageBuffer = await readFile(receiptLogoPath);
			return `data:image/png;base64,${imageBuffer.toString("base64")}`;
		} catch {
			return null;
		}
	}
}

function printSection(printer: ThermalPrinter, title: string, value: string) {
	printer.bold(true);
	printer.println(title);
	printer.bold(false);
	printer.println(value);
	printer.newLine();
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
