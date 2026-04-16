import type { ColDef } from "ag-grid-community";
import dayjs from "dayjs";

export const orderColDefs: ColDef[] = [
	{
		headerName: "#",
		valueGetter: (p) => `#${p.data?.id}`,
		width: 80,
		flex: 0,
		filter: false,
	},
	{
		headerName: "Customer",
		field: "customer.name",
		flex: 1,
		filter: true,
	},
	{
		headerName: "Device",
		flex: 1,
		filter: true,
		valueGetter: (p) => [p.data?.deviceBrand, p.data?.deviceModel].filter(Boolean).join(" ") || "—",
	},
	{
		headerName: "Problem",
		field: "problem",
		flex: 2,
		filter: true,
	},
	{
		headerName: "Status",
		flex: 1,
		filter: true,
		valueGetter: (p) => formatLabel(p.data?.status ?? ""),
	},
	{
		headerName: "Total",
		flex: 1,
		filter: false,
		valueGetter: (p) => p.data?.finalTotal ?? p.data?.estimate,
		valueFormatter: (p) => (p.value != null ? `$${(p.value as number).toFixed(2)}` : "—"),
	},
	{
		headerName: "Date",
		field: "createdAt",
		flex: 1,
		filter: false,
		sort: "desc",
		valueFormatter: (p) => dayjs(p.value as string).format("MMM D, YYYY"),
	},
];

function formatLabel(value: string): string {
	return value
		.split("_")
		.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
		.join(" ");
}
