import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import type { AgCartesianChartOptions, AgPolarChartOptions } from "ag-charts-community";
import { RouterLink } from "@angular/router";
import { OrderStatus } from "../models/models";
import { AgChartComponent } from "../ag-chart/ag-chart";
import { Data } from "../services/data";

type DashboardStat = {
	label: string;
	value: string;
	detail: string;
	route: string;
	accentClass: string;
};

type StatusChartDatum = {
	label: string;
	value: number;
};

type ActivityChartDatum = {
	label: string;
	customers: number;
	orders: number;
};

@Component({
	selector: "app-dashboard",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, AgChartComponent],
	templateUrl: "./dashboard.html",
})
export class Dashboard {
	private readonly dataService = inject(Data);

	readonly loading = this.dataService.loading;
	readonly customers = computed(() => this.dataService.appData().customers);
	readonly orders = computed(() => this.dataService.appData().orders);

	readonly totalCustomers = computed(() => this.customers().length);
	readonly totalOrders = computed(() => this.orders().length);
	readonly ordersInRepair = computed(
		() => this.orders().filter((order) => order.status === OrderStatus.IN_REPAIR).length,
	);
	readonly readyOrders = computed(() => this.orders().filter((order) => order.status === OrderStatus.READY).length);
	readonly pendingOrders = computed(() => this.orders().filter((order) => order.status === OrderStatus.PENDING).length);
	readonly completedOrders = computed(
		() => this.orders().filter((order) => order.status === OrderStatus.COMPLETED).length,
	);
	readonly statCards = computed<DashboardStat[]>(() => [
		{
			label: "Total customers",
			value: this.totalCustomers().toString(),
			detail: "Open the customer workspace to view and manage your full client list.",
			route: "/customer",
			accentClass: "from-cyan-500/30 via-sky-400/10 to-transparent",
		},
		{
			label: "Total orders",
			value: this.totalOrders().toString(),
			detail: "Jump into orders to inspect repair progress, pricing, and device details.",
			route: "/order",
			accentClass: "from-emerald-500/30 via-teal-400/10 to-transparent",
		},
		{
			label: "Orders in repair",
			value: this.ordersInRepair().toString(),
			detail: "Devices that are actively being worked on right now.",
			route: "/order",
			accentClass: "from-amber-500/30 via-orange-400/10 to-transparent",
		},
		{
			label: "Ready orders",
			value: this.readyOrders().toString(),
			detail: "Finished jobs that are ready for pickup or delivery.",
			route: "/order",
			accentClass: "from-fuchsia-500/25 via-pink-400/10 to-transparent",
		},
	]);
	readonly statusChartData = computed<StatusChartDatum[]>(() =>
		[
			{ label: "Pending", value: this.pendingOrders() },
			{ label: "In repair", value: this.ordersInRepair() },
			{ label: "Ready", value: this.readyOrders() },
			{ label: "Completed", value: this.completedOrders() },
		].filter((item) => item.value > 0),
	);
	readonly monthlyActivityData = computed<ActivityChartDatum[]>(() => {
		const months = getRecentMonthBuckets(6);

		for (const customer of this.customers()) {
			const key = getMonthKey(customer.createdAt);
			const bucket = months.get(key);
			if (bucket) {
				bucket.customers += 1;
			}
		}

		for (const order of this.orders()) {
			const key = getMonthKey(order.createdAt);
			const bucket = months.get(key);
			if (bucket) {
				bucket.orders += 1;
			}
		}

		return Array.from(months.values());
	});
	readonly statusChartOptions = computed<AgPolarChartOptions>(() => ({
		height: 320,
		baseTheme: "ag-default-dark",
		background: {
			fill: "transparent",
		},
		data: this.statusChartData(),
		overlays: {
			noData: {
				text: "No order data yet",
			},
		},
		palette: {
			fills: ["#22d3ee", "#f59e0b", "#ec4899", "#10b981"],
			strokes: ["#22d3ee", "#f59e0b", "#ec4899", "#10b981"],
		},
		series: [
			{
				type: "donut",
				angleKey: "value",
				calloutLabelKey: "label",
				sectorLabelKey: "value",
				innerRadiusRatio: 0.7,
				strokeWidth: 0,
			},
		],
		legend: {
			position: "bottom",
			spacing: 20,
			item: {
				label: {
					color: "#cbd5e1",
				},
			},
		},
		tooltip: {
			enabled: true,
		},
		theme: {
			baseTheme: "ag-default-dark",
			params: {
				backgroundColor: "transparent",
				foregroundColor: "#e2e8f0",
				accentColor: "#22d3ee",
			},
		},
	}));
	readonly monthlyActivityChartOptions = computed<AgCartesianChartOptions>(() => ({
		height: 320,
		baseTheme: "ag-default-dark",
		background: {
			fill: "transparent",
		},
		data: this.monthlyActivityData(),
		overlays: {
			noData: {
				text: "No activity data yet",
			},
		},
		palette: {
			fills: ["#22c55e", "#38bdf8"],
			strokes: ["#22c55e", "#38bdf8"],
		},
		series: [
			{
				type: "bar",
				direction: "vertical",
				xKey: "label",
				yKey: "orders",
				yName: "Orders",
				fill: "#22c55e",
				stroke: "#22c55e",
				cornerRadius: 10,
			},
			{
				type: "bar",
				direction: "vertical",
				xKey: "label",
				yKey: "customers",
				yName: "Customers",
				fill: "#38bdf8",
				stroke: "#38bdf8",
				cornerRadius: 10,
			},
		],
		axes: {
			x: {
				type: "category",
				position: "bottom",
				label: {
					color: "#94a3b8",
				},
				line: {
					stroke: "#334155",
				},
			},
			y: {
				type: "number",
				position: "left",
				label: {
					color: "#94a3b8",
				},
				gridLine: {
					enabled: true,
					style: [
						{
							stroke: "#1e293b",
							lineDash: [4, 4],
						},
					],
				},
			},
		},
		legend: {
			position: "bottom",
			item: {
				label: {
					color: "#cbd5e1",
				},
			},
		},
		theme: {
			baseTheme: "ag-default-dark",
			params: {
				backgroundColor: "transparent",
				foregroundColor: "#e2e8f0",
				accentColor: "#38bdf8",
			},
		},
	}));

	constructor() {
		if (this.totalCustomers() === 0 && this.totalOrders() === 0 && !this.loading()) {
			void this.dataService.loadAppData();
		}
	}
}

function getRecentMonthBuckets(count: number): Map<string, ActivityChartDatum> {
	const buckets = new Map<string, ActivityChartDatum>();
	const now = new Date();

	for (let offset = count - 1; offset >= 0; offset -= 1) {
		const current = new Date(now.getFullYear(), now.getMonth() - offset, 1);
		const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
		buckets.set(key, {
			label: current.toLocaleString("en-US", { month: "short" }),
			customers: 0,
			orders: 0,
		});
	}

	return buckets;
}

function getMonthKey(value: string): string {
	const date = new Date(value);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
