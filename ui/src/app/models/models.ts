export type LoginPayload = {
	email: string;
	password: string;
};

export type SignupPayload = {
	name: string;
	email: string;
	password: string;
};

export enum OrderStatus {
	PENDING = "PENDING",
	DIAGNOSIS = "DIAGNOSIS",
	WAITING_APPROVAL = "WAITING_APPROVAL",
	IN_REPAIR = "IN_REPAIR",
	READY = "READY",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

export enum InvoiceStatus {
	UNPAID = "UNPAID",
	PARTIALLY_PAID = "PARTIALLY_PAID",
	PAID = "PAID",
	VOID = "VOID",
}

export enum PaymentMethod {
	CASH = "CASH",
	CARD = "CARD",
	BANK_TRANSFER = "BANK_TRANSFER",
	OTHER = "OTHER",
}

export type Customer = {
	id: number;
	name: string;
	phone: string | null;
	email: string | null;
	address: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;

	orders: Order[];
};

export type Order = {
	id: number;
	status: OrderStatus;
	problem: string;
	technicianNotes: string | null;
	intakeNotes: string | null;

	deviceType: string | null;
	deviceBrand: string | null;
	deviceModel: string | null;
	serialNumber: string | null;

	estimate: number | null;
	finalTotal: number | null;

	invoiceStatus: InvoiceStatus;
	invoiceDueAt: string | null; // ISO date string
	invoicePaidAt: string | null; // ISO date string
	paymentMethod: PaymentMethod | null;

	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string

	customerId: number;
	customer: Customer;
};

export type CreateCustomerDto = Omit<Customer, "id" | "createdAt" | "updatedAt" | "orders">;

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export type CreateOrderDto = Omit<Order, "id" | "createdAt" | "updatedAt" | "customer">;

export type UpdateOrderDto = Partial<CreateOrderDto>;

export type appData = {
	customers: Customer[];
	orders: Order[];
};
