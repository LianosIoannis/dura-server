import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NgxSpinnerComponent, NgxSpinnerService } from "ngx-spinner";
import { Data } from "./services/data";

@Component({
	selector: "app-root",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterOutlet, NgxSpinnerComponent],
	templateUrl: "./app.html",
})
export class App {
	private readonly dataService = inject(Data);
	private readonly spinnerService = inject(NgxSpinnerService);

	readonly loading = this.dataService.loading;

	// biome-ignore lint/correctness/noUnusedPrivateClassMembers: <effect is used to react to changes in loading state>
	private readonly spinnerEffect = effect(() => {
		const _ = this.loading() ? this.spinnerService.show() : this.spinnerService.hide();
	});
}
