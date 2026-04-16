import { Component, computed, input, output, type Signal } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import {
	ClientSideRowModelModule,
	type ColDef,
	ColumnAutoSizeModule,
	colorSchemeVariable,
	type GridOptions,
	ModuleRegistry,
	PaginationModule,
	type RowClickedEvent,
	RowSelectionModule,
	type RowSelectionOptions,
	TextFilterModule,
	themeAlpine,
} from "ag-grid-community";

ModuleRegistry.registerModules([
	ClientSideRowModelModule,
	PaginationModule,
	TextFilterModule,
	RowSelectionModule,
	ColumnAutoSizeModule,
]);

@Component({
	selector: "app-ag-table",
	imports: [AgGridAngular],
	templateUrl: "./ag-table.html",
})
export class AgTable<T extends object> {
	themeAlpine = themeAlpine.withPart(colorSchemeVariable);

	rowClicked = output<T>();

	inputRowData = input<T[]>([]);
	inputColDefs = input<ColDef[]>([]);

	columnDefs: Signal<ColDef[]> = computed(() => {
		const custom = this.inputColDefs();
		if (custom.length > 0) {
			return custom;
		}
		const rowData = this.inputRowData();
		if (rowData.length === 0) {
			return [];
		}
		return Object.keys(rowData[0]).map((key) => ({
			field: key,
			filter: true,
			sortable: true,
			editable: false,
			flex: 1,
		}));
	});

	rowSelection: RowSelectionOptions = {
		mode: "singleRow",
		enableClickSelection: true,
		checkboxes: false,
	};

	gridOptions: GridOptions = {
		theme: this.themeAlpine,
		suppressCellFocus: true,
		pagination: true,
		paginationPageSize: 10,
		paginationPageSizeSelector: [10, 15, 20, 50],
	};

	onRowClicked(event: RowClickedEvent) {
		this.rowClicked.emit(event.data);
	}
}
