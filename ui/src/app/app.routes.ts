import type { Routes } from "@angular/router";

export const routes: Routes = [
	{
		path: "signin",
		loadComponent: () => import("./signin/signin").then((module) => module.Signin),
	},
	{
		path: "signup",
		loadComponent: () => import("./signup/signup").then((module) => module.Signup),
	},
	{
		path: "dashboard",
		loadComponent: () => import("./dashboard/dashboard").then((module) => module.Dashboard),
	},
	{
		path: "customer/:id",
		loadComponent: () => import("./customer/customer").then((module) => module.CustomerComponent),
	},
	{
		path: "customer",
		loadComponent: () => import("./customer/customer").then((module) => module.CustomerComponent),
	},
	{
		path: "order/:id",
		loadComponent: () => import("./order/order").then((module) => module.OrderComponent),
	},
	{
		path: "order/for-customer/:customerId",
		loadComponent: () => import("./order/order").then((module) => module.OrderComponent),
	},
	{
		path: "order",
		loadComponent: () => import("./order/order").then((module) => module.OrderComponent),
	},
	{
		path: "",
		redirectTo: "signin",
		pathMatch: "full",
	},
	{
		path: "**",
		redirectTo: "signin",
	},
];
