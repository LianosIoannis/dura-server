import { Component, inject, signal } from "@angular/core";
import { email, FormField, FormRoot, form, required } from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Auth } from "../services/auth";
import { Data } from "../services/data";

@Component({
	selector: "app-signin",
	standalone: true,
	imports: [FormField, FormRoot, RouterLink],
	templateUrl: "./signin.html",
})
export class Signin {
	private readonly authService = inject(Auth);
	private readonly dataService = inject(Data);
	private readonly router = inject(Router);
	private readonly toastr = inject(ToastrService);

	loginModel = signal({
		email: "",
		password: "",
	});

	loginForm = form(
		this.loginModel,
		(path) => {
			required(path.email, { message: "Email is required" });
			email(path.email, { message: "Enter a valid email address" });
			required(path.password, { message: "Password is required" });
		},
		{
			submission: {
				action: async () => {
					try {
						const credentials = this.loginModel();

						await this.authService.login(credentials);
						this.dataService.loadAppData();
						this.toastr.success("You have signed in successfully.", "Login successful");
						this.router.navigate(["/dashboard"]);
					} catch (error) {
						const message = error instanceof Error ? error.message : "Login failed";
						this.toastr.error(message, "Login failed");
					}

					return null;
				},
			},
		},
	);
}
