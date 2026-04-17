import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import type { appData } from "./../models/models";
import type {
	CreateCustomerDto,
	CreateOrderDto,
	Customer,
	Order,
	UpdateCustomerDto,
	UpdateOrderDto,
} from "../models/models";
import { Auth } from "./auth";

@Injectable({
	providedIn: "root",
})
export class Data {
	private readonly baseUrl = "http://localhost:3000";

	authService = inject(Auth);
	router = inject(Router);

	loading = signal(false);
	appData = signal<appData>({ customers: [], orders: [] });

	async loadAppData() {
		this.loading.set(true);
		try {
			const [customers, orders] = await Promise.all([this.getCustomers(), this.getOrders()]);
			this.appData.set({ customers, orders });
		} catch (error) {
			console.error("Failed to load app data:", error);
		} finally {
			this.loading.set(false);
		}
	}

	private get headers(): HeadersInit {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.authService.token()}`,
		};
	}

	private async request<T>(path: string, init: RequestInit, errorMessage: string): Promise<T> {
		const res = await fetch(`${this.baseUrl}${path}`, {
			...init,
			headers: {
				...this.headers,
				...init.headers,
			},
		});

		if (res.status === 401) {
			this.authService.logout();
			this.router.navigate(["/login"]);
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error(errorMessage);
		}

		return (await res.json()) as T;
	}

	private async requestAndRefresh<T>(path: string, init: RequestInit, errorMessage: string): Promise<T> {
		const result = await this.request<T>(path, init, errorMessage);
		await this.loadAppData();
		return result;
	}

	getCustomers(): Promise<Customer[]> {
		return this.request<Customer[]>("/customer/all", {}, "Failed to fetch customers");
	}

	getOrders(): Promise<Order[]> {
		return this.request<Order[]>("/order/all", {}, "Failed to fetch orders");
	}

	createCustomer(customer: CreateCustomerDto): Promise<Customer> {
		return this.requestAndRefresh<Customer>(
			"/customer/create",
			{
				method: "POST",
				body: JSON.stringify(customer),
			},
			"Failed to create customer",
		);
	}

	createOrder(order: CreateOrderDto): Promise<Order> {
		return this.requestAndRefresh<Order>(
			"/order/create",
			{
				method: "POST",
				body: JSON.stringify(order),
			},
			"Failed to create order",
		);
	}

	updateCustomer(id: number, customer: UpdateCustomerDto): Promise<Customer> {
		return this.requestAndRefresh<Customer>(
			`/customer/update/${id}`,
			{
				method: "PATCH",
				body: JSON.stringify(customer),
			},
			"Failed to update customer",
		);
	}

	updateOrder(id: number, order: UpdateOrderDto): Promise<Order> {
		return this.requestAndRefresh<Order>(
			`/order/update/${id}`,
			{
				method: "PATCH",
				body: JSON.stringify(order),
			},
			"Failed to update order",
		);
	}

	deleteCustomer(id: number): Promise<unknown> {
		return this.requestAndRefresh<unknown>(
			`/customer/delete/${id}`,
			{
				method: "DELETE",
			},
			"Failed to delete customer",
		);
	}

	deleteOrder(id: number): Promise<unknown> {
		return this.requestAndRefresh<unknown>(
			`/order/delete/${id}`,
			{
				method: "DELETE",
			},
			"Failed to delete order",
		);
	}
}
