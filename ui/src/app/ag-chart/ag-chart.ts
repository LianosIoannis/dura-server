import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { AgCharts } from "ag-charts-angular";
import { AllCommunityModule, ModuleRegistry, type AgChartOptions } from "ag-charts-community";

let chartsModulesRegistered = false;

if (!chartsModulesRegistered) {
	ModuleRegistry.registerModules(AllCommunityModule);
	chartsModulesRegistered = true;
}

@Component({
	selector: "app-ag-chart",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AgCharts],
	templateUrl: "./ag-chart.html",
	host: {
		class: "block",
	},
})
export class AgChartComponent {
	title = input.required<string>();
	subtitle = input("");
	options = input.required<AgChartOptions>();
	height = input(320);
}
