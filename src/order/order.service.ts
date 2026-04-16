/** biome-ignore-all lint/style/useImportType: <nest> */
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrderService {
	constructor(private readonly prisma: PrismaService) {}

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
}
