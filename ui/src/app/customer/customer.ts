import { CurrencyPipe, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from "@angular/core";
import { email, FormField, FormRoot, form, required } from "@angular/forms/signals";
import { Router } from "@angular/router";
import type { ColDef } from "ag-grid-community";
import { ToastrService } from "ngx-toastr";
import { AgTable } from "../ag-table/ag-table";
import type { CreateCustomerDto, Customer, UpdateCustomerDto } from "../models/models";
import { Data } from "../services/data";

type CustomerFormModel = {
	name: string;
	email: string;
	phone: string;
	address: string;
	notes: string;
};

@Component({
	selector: "app-customer",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AgTable, CurrencyPipe, DatePipe, FormField, FormRoot],
	templateUrl: "./customer.html",
})
export class CustomerComponent {
	private readonly dataService = inject(Data);
	private readonly router = inject(Router);
	private readonly toastr = inject(ToastrService);

	readonly id = input<number | null, string | number | null>(null, {
		transform: (value) => (value == null ? null : Number(value)),
	});

	readonly loading = this.dataService.loading;
	readonly customers = computed(() => this.dataService.appData().customers);
	readonly orders = computed(() => this.dataService.appData().orders);
	readonly isListView = computed(() => this.id() === null);
	readonly customer = computed(() => this.customers().find((customer) => customer.id === this.id()) ?? null);
	readonly totalLinkedOrders = computed(() => this.orders().length);
	readonly showEditCard = signal(false);
	readonly showCreateCard = signal(false);
	private readonly hasRequestedInitialLoad = signal(false);

	readonly customerColDefs: ColDef<Customer>[] = [
		{
			headerName: "Customer",
			field: "name",
			flex: 1.4,
			filter: true,
		},
		{
			headerName: "Email",
			flex: 1.4,
			valueGetter: ({ data }) => data?.email ?? "—",
			filter: true,
		},
		{
			headerName: "Phone",
			flex: 1,
			valueGetter: ({ data }) => data?.phone ?? "—",
			filter: true,
		},
		{
			headerName: "Orders",
			flex: 0.7,
			valueGetter: ({ data }) => (data ? this.getOrderCount(data) : 0),
			filter: false,
		},
		{
			headerName: "Created",
			flex: 1,
			valueGetter: ({ data }) =>
				data?.createdAt
					? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
							new Date(data.createdAt),
						)
					: "—",
			filter: false,
		},
	];

	readonly formModel = signal<CustomerFormModel>({
		name: "",
		email: "",
		phone: "",
		address: "",
		notes: "",
	});

	readonly createFormModel = signal<CustomerFormModel>({
		name: "",
		email: "",
		phone: "",
		address: "",
		notes: "",
	});

	readonly customerForm = form(
		this.formModel,
		(path) => {
			required(path.name, { message: "Name is required" });
			email(path.email, { message: "Enter a valid email address" });
		},
		{
			submission: {
				action: async () => {
					const currentCustomer = this.customer();

					if (!currentCustomer) {
						this.toastr.error("Customer not found.", "Update failed");
						return null;
					}

					try {
						await this.dataService.updateCustomer(currentCustomer.id, this.buildPayload());
						this.syncForm(this.customer());
						this.toastr.success("Customer details saved.", "Customer updated");
					} catch (error) {
						const message = error instanceof Error ? error.message : "Failed to update customer";
						this.toastr.error(message, "Update failed");
					}

					return null;
				},
			},
		},
	);
	readonly createCustomerForm = form(
		this.createFormModel,
		(path) => {
			required(path.name, { message: "Name is required" });
			email(path.email, { message: "Enter a valid email address" });
		},
		{
			submission: {
				action: async () => {
					try {
						const createdCustomer = await this.dataService.createCustomer(this.buildCreatePayload());
						this.resetCreateForm();
						this.showCreateCard.set(false);
						this.toastr.success("Customer created successfully.", "Customer created");
						void this.router.navigate(["/customer", createdCustomer.id]);
					} catch (error) {
						const message = error instanceof Error ? error.message : "Failed to create customer";
						this.toastr.error(message, "Create failed");
					}

					return null;
				},
			},
		},
	);

	readonly orderCount = computed(() => (this.customer() ? this.getOrderCount(this.customer()) : 0));
	readonly lifetimeValue = computed(() =>
		this.getCustomerOrders(this.customer()).reduce((sum, order) => sum + (order.finalTotal ?? order.estimate ?? 0), 0),
	);

	constructor() {
		effect(() => {
			const customers = this.customers();
			const loading = this.loading();

			if (customers.length === 0 && !loading && !this.hasRequestedInitialLoad()) {
				this.hasRequestedInitialLoad.set(true);
				void this.dataService.loadAppData();
			}
		});

		effect(() => {
			const currentCustomer = this.customer();
			this.syncForm(currentCustomer);
			this.showEditCard.set(false);
		});
	}

	openCustomer(customer: Customer): void {
		void this.router.navigate(["/customer", customer.id]);
	}

	goToDashboard(): void {
		void this.router.navigate(["/dashboard"]);
	}

	backToList(): void {
		void this.router.navigate(["/customer"]);
	}

	resetForm(): void {
		this.syncForm(this.customer());
	}

	toggleEditCard(): void {
		this.showEditCard.update((value) => !value);
	}

	toggleCreateCard(): void {
		this.showCreateCard.update((value) => !value);
	}

	resetCreateForm(): void {
		this.createFormModel.set(createEmptyCustomerFormModel());
	}

	async deleteCustomer(): Promise<void> {
		const currentCustomer = this.customer();
		if (!currentCustomer) {
			return;
		}

		const confirmed = globalThis.confirm(`Delete customer "${currentCustomer.name}"? This action cannot be undone.`);
		if (!confirmed) {
			return;
		}

		try {
			await this.dataService.deleteCustomer(currentCustomer.id);
			this.toastr.success("Customer deleted successfully.", "Customer deleted");
			void this.router.navigate(["/customer"]);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete customer";
			this.toastr.error(message, "Delete failed");
		}
	}

	viewOrders(): void {
		const currentCustomer = this.customer();
		if (!currentCustomer) {
			return;
		}

		void this.router.navigate(["/order/for-customer", currentCustomer.id]);
	}

	private getCustomerOrders(customer: Customer | null): Customer["orders"] {
		if (!customer) {
			return [];
		}

		return this.orders().filter((order) => order.customerId === customer.id);
	}

	private getOrderCount(customer: Customer | null): number {
		return this.getCustomerOrders(customer).length;
	}

	private syncForm(customer: Customer | null): void {
		if (!customer) {
			this.formModel.set(createEmptyCustomerFormModel());
			return;
		}

		this.formModel.set({
			name: customer.name,
			email: customer.email ?? "",
			phone: customer.phone ?? "",
			address: customer.address ?? "",
			notes: customer.notes ?? "",
		});
	}

	private buildPayload(): UpdateCustomerDto {
		const model = this.formModel();

		return {
			name: model.name.trim(),
			email: normalizeOptionalString(model.email),
			phone: normalizeOptionalString(model.phone),
			address: normalizeOptionalString(model.address),
			notes: normalizeOptionalString(model.notes),
		};
	}

	private buildCreatePayload(): CreateCustomerDto {
		const model = this.createFormModel();

		return {
			name: model.name.trim(),
			email: normalizeOptionalString(model.email),
			phone: normalizeOptionalString(model.phone),
			address: normalizeOptionalString(model.address),
			notes: normalizeOptionalString(model.notes),
		};
	}
}

function normalizeOptionalString(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function createEmptyCustomerFormModel(): CustomerFormModel {
	return {
		name: "",
		email: "",
		phone: "",
		address: "",
		notes: "",
	};
}
