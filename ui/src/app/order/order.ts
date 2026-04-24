import { CurrencyPipe, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from "@angular/core";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AgTable } from "../ag-table/ag-table";
import type {
	CreateOrderDto,
	Order,
	OrderStatus,
	PaymentMethod,
	UpdateOrderDto,
	InvoiceStatus,
} from "../models/models";
import {
	InvoiceStatus as InvoiceStatusEnum,
	OrderStatus as OrderStatusEnum,
	PaymentMethod as PaymentMethodEnum,
} from "../models/models";
import { orderColDefs } from "./orderColDef.model";
import { Data } from "../services/data";

type OrderFormModel = {
	customerId: string;
	status: OrderStatus;
	problem: string;
	deviceType: string;
	deviceBrand: string;
	deviceModel: string;
	serialNumber: string;
	intakeNotes: string;
	technicianNotes: string;
	estimate: string;
	finalTotal: string;
	invoiceStatus: InvoiceStatus;
	paymentMethod: PaymentMethod | "";
	invoiceDueAt: string;
	invoicePaidAt: string;
};

@Component({
	selector: "app-order",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AgTable, CurrencyPipe, DatePipe, FormField, FormRoot],
	templateUrl: "./order.html",
})
export class OrderComponent {
	private readonly dataService = inject(Data);
	private readonly router = inject(Router);
	private readonly toastr = inject(ToastrService);

	readonly id = input<number | null, string | number | null>(null, {
		transform: (value) => (value == null ? null : Number(value)),
	});

	readonly customerId = input<number | null, string | number | null>(null, {
		transform: (value) => (value == null ? null : Number(value)),
	});

	readonly loading = this.dataService.loading;
	readonly orders = computed(() => this.dataService.appData().orders);
	readonly customers = computed(() => this.dataService.appData().customers);
	readonly isListView = computed(() => this.id() === null);
	readonly filteredOrders = computed(() => {
		const customerId = this.customerId();
		if (customerId === null) {
			return this.orders();
		}

		return this.orders().filter((order) => order.customerId === customerId);
	});
	readonly order = computed(() => this.orders().find((order) => order.id === this.id()) ?? null);
	readonly selectedCustomer = computed(() =>
		this.customerId() === null
			? null
			: (this.customers().find((customer) => customer.id === this.customerId()) ?? null),
	);
	readonly totalOrderValue = computed(() =>
		this.filteredOrders().reduce((sum, order) => sum + (order.finalTotal ?? order.estimate ?? 0), 0),
	);
	readonly showEditCard = signal(false);
	readonly showCreateCard = signal(false);
	readonly hasRequestedInitialLoad = signal(false);

	readonly statusOptions = Object.values(OrderStatusEnum);
	readonly invoiceStatusOptions = Object.values(InvoiceStatusEnum);
	readonly paymentMethodOptions = Object.values(PaymentMethodEnum);
	readonly orderColDefs = orderColDefs;
	readonly customerOptions = computed(() =>
		this.customers().map((customer) => ({ id: customer.id, name: customer.name })),
	);

	readonly formModel = signal<OrderFormModel>(createEmptyOrderFormModel());
	readonly createFormModel = signal<OrderFormModel>(createEmptyOrderFormModel());
	readonly orderForm = form(
		this.formModel,
		(path) => {
			required(path.customerId, { message: "Customer is required" });
			required(path.problem, { message: "Problem is required" });
		},
		{
			submission: {
				action: async () => {
					const currentOrder = this.order();

					if (!currentOrder) {
						this.toastr.error("Order not found.", "Update failed");
						return null;
					}

					try {
						await this.dataService.updateOrder(currentOrder.id, this.buildPayload());
						this.syncForm(this.order());
						this.toastr.success("Order details saved.", "Order updated");
					} catch (error) {
						const message = error instanceof Error ? error.message : "Failed to update order";
						this.toastr.error(message, "Update failed");
					}

					return null;
				},
			},
		},
	);
	readonly createOrderForm = form(
		this.createFormModel,
		(path) => {
			required(path.customerId, { message: "Customer is required" });
			required(path.problem, { message: "Problem is required" });
		},
		{
			submission: {
				action: async () => {
					try {
						const createdOrder = await this.dataService.createOrder(this.buildCreatePayload());
						this.resetCreateForm();
						this.showCreateCard.set(false);
						this.toastr.success("Order created successfully.", "Order created");
						void this.router.navigate(["/order", createdOrder.id]);
					} catch (error) {
						const message = error instanceof Error ? error.message : "Failed to create order";
						this.toastr.error(message, "Create failed");
					}

					return null;
				},
			},
		},
	);

	constructor() {
		effect(() => {
			if (this.orders().length === 0 && !this.loading() && !this.hasRequestedInitialLoad()) {
				this.hasRequestedInitialLoad.set(true);
				void this.dataService.loadAppData();
			}
		});

		effect(() => {
			this.syncForm(this.order());
			this.showEditCard.set(false);
		});
	}

	openOrder(order: Order): void {
		void this.router.navigate(["/order", order.id]);
	}

	goToDashboard(): void {
		void this.router.navigate(["/dashboard"]);
	}

	async printSelectedOrder(): Promise<void> {
		const currentOrder = this.order();
		if (!currentOrder) {
			this.toastr.error("Order not found.", "Print failed");
			return;
		}

		try {
			await this.dataService.printOrder(currentOrder.id);
			this.toastr.success("Print request sent.", "Order print");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to print order";
			this.toastr.error(message, "Print failed");
		}
	}

	backToList(): void {
		const customerId = this.customerId();
		void this.router.navigate(customerId === null ? ["/order"] : ["/order/for-customer", customerId]);
	}

	openCustomer(customerId: number): void {
		void this.router.navigate(["/customer", customerId]);
	}

	resetForm(): void {
		this.syncForm(this.order());
	}

	toggleEditCard(): void {
		this.showEditCard.update((value) => !value);
	}

	toggleCreateCard(): void {
		this.showCreateCard.update((value) => !value);
	}

	resetCreateForm(): void {
		this.createFormModel.set(createEmptyOrderFormModel());
	}

	async deleteOrder(): Promise<void> {
		const currentOrder = this.order();
		if (!currentOrder) {
			return;
		}

		const confirmed = globalThis.confirm(`Delete order #${currentOrder.id}? This action cannot be undone.`);
		if (!confirmed) {
			return;
		}

		try {
			await this.dataService.deleteOrder(currentOrder.id);
			this.toastr.success("Order deleted successfully.", "Order deleted");
			void this.router.navigate(["/order"]);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete order";
			this.toastr.error(message, "Delete failed");
		}
	}

	private syncForm(order: Order | null): void {
		if (!order) {
			this.formModel.set(createEmptyOrderFormModel());
			return;
		}

		this.formModel.set({
			customerId: String(order.customerId),
			status: order.status,
			problem: order.problem,
			deviceType: order.deviceType ?? "",
			deviceBrand: order.deviceBrand ?? "",
			deviceModel: order.deviceModel ?? "",
			serialNumber: order.serialNumber ?? "",
			intakeNotes: order.intakeNotes ?? "",
			technicianNotes: order.technicianNotes ?? "",
			estimate: order.estimate?.toString() ?? "",
			finalTotal: order.finalTotal?.toString() ?? "",
			invoiceStatus: order.invoiceStatus,
			paymentMethod: order.paymentMethod ?? "",
			invoiceDueAt: toDateInputValue(order.invoiceDueAt),
			invoicePaidAt: toDateInputValue(order.invoicePaidAt),
		});
	}

	private buildPayload(): UpdateOrderDto {
		const model = this.formModel();

		return {
			customerId: Number(model.customerId),
			status: model.status,
			problem: model.problem.trim(),
			deviceType: normalizeOptionalString(model.deviceType),
			deviceBrand: normalizeOptionalString(model.deviceBrand),
			deviceModel: normalizeOptionalString(model.deviceModel),
			serialNumber: normalizeOptionalString(model.serialNumber),
			intakeNotes: normalizeOptionalString(model.intakeNotes),
			technicianNotes: normalizeOptionalString(model.technicianNotes),
			estimate: normalizeOptionalNumber(model.estimate),
			finalTotal: normalizeOptionalNumber(model.finalTotal),
			invoiceStatus: model.invoiceStatus,
			paymentMethod: model.paymentMethod === "" ? null : model.paymentMethod,
			invoiceDueAt: normalizeOptionalDate(model.invoiceDueAt),
			invoicePaidAt: normalizeOptionalDate(model.invoicePaidAt),
		};
	}

	private buildCreatePayload(): CreateOrderDto {
		const model = this.createFormModel();

		return {
			customerId: Number(model.customerId),
			status: model.status,
			problem: model.problem.trim(),
			deviceType: normalizeOptionalString(model.deviceType),
			deviceBrand: normalizeOptionalString(model.deviceBrand),
			deviceModel: normalizeOptionalString(model.deviceModel),
			serialNumber: normalizeOptionalString(model.serialNumber),
			intakeNotes: normalizeOptionalString(model.intakeNotes),
			technicianNotes: normalizeOptionalString(model.technicianNotes),
			estimate: normalizeOptionalNumber(model.estimate),
			finalTotal: normalizeOptionalNumber(model.finalTotal),
			invoiceStatus: model.invoiceStatus,
			paymentMethod: model.paymentMethod === "" ? null : model.paymentMethod,
			invoiceDueAt: normalizeOptionalDate(model.invoiceDueAt),
			invoicePaidAt: normalizeOptionalDate(model.invoicePaidAt),
		};
	}
}

function createEmptyOrderFormModel(): OrderFormModel {
	return {
		customerId: "",
		status: OrderStatusEnum.PENDING,
		problem: "",
		deviceType: "",
		deviceBrand: "",
		deviceModel: "",
		serialNumber: "",
		intakeNotes: "",
		technicianNotes: "",
		estimate: "",
		finalTotal: "",
		invoiceStatus: InvoiceStatusEnum.UNPAID,
		paymentMethod: "",
		invoiceDueAt: "",
		invoicePaidAt: "",
	};
}

function normalizeOptionalString(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalNumber(value: string): number | null {
	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return null;
	}

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalDate(value: string): string | null {
	const trimmed = value.trim();
	if (trimmed.length === 0) {
		return null;
	}

	return `${trimmed}T00:00:00.000Z`;
}

function toDateInputValue(value: string | null): string {
	return value ? value.slice(0, 10) : "";
}
