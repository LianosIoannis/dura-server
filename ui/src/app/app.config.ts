import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideToastr, ToastNoAnimation } from "ngx-toastr";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes, withComponentInputBinding()),
		provideToastr({ positionClass: "toast-bottom-right", toastComponent: ToastNoAnimation, timeOut: 1500 }),
		provideAnimations(),
	],
};
