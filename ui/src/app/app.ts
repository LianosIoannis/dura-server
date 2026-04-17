import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NgxSpinnerComponent } from "ngx-spinner";
import { Data } from "./services/data";

@Component({
	selector: "app-root",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterOutlet, NgxSpinnerComponent],
	templateUrl: "./app.html",
})
export class App {
	private readonly dataService = inject(Data);

	readonly loading = this.dataService.loading;
}
