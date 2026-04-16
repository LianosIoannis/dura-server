import { Component, inject, signal } from "@angular/core";
import { email, FormField, FormRoot, form, minLength, required } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Auth } from "../services/auth";

@Component({
	selector: "app-signup",
	standalone: true,
	imports: [FormField, FormRoot, RouterLink],
	templateUrl: "./signup.html",
})
export class Signup {
	authService = inject(Auth);
	toastr = inject(ToastrService);

	signupModel = signal({
		email: "",
		name: "",
		password: "",
	});

	signupForm = form(
		this.signupModel,
		(path) => {
			required(path.email, { message: "Email is required" });

			email(path.email, { message: "Enter a valid email address" });

			required(path.name, { message: "Name is required" });

			required(path.password, { message: "Password is required" });

			minLength(path.password, 6, {
				message: "Password must be at least 6 characters",
			});
		},
		{
			submission: {
				action: async () => {
					try {
						const payload = this.signupModel();

						await this.authService.signup(payload);
						this.toastr.success("Your account has been created successfully.", "Signup successful");
					} catch (error) {
						const message = error instanceof Error ? error.message : "Signup failed";
						this.toastr.error(message, "Signup failed");
					}

					return null;
				},
			},
		},
	);
}
