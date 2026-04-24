import { Injectable, signal } from "@angular/core";
import type { LoginPayload, SignupPayload } from "../models/models";

@Injectable({
	providedIn: "root",
})
export class Auth {
	private readonly baseUrl = "";
	private readonly TOKEN_KEY = "token";

	token = signal<string | null>(sessionStorage.getItem(this.TOKEN_KEY));

	private setToken(token: string | null) {
		if (token) {
			sessionStorage.setItem(this.TOKEN_KEY, token);
		} else {
			sessionStorage.removeItem(this.TOKEN_KEY);
		}

		this.token.set(token);
	}

	async login(payload: LoginPayload) {
		const res = await fetch(`${this.baseUrl}/user/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data?.message || "Login failed");
		}

		this.setToken(data?.token ?? null);
		return data;
	}

	async signup(payload: SignupPayload) {
		const res = await fetch(`${this.baseUrl}/user/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data?.message || "Signup failed");
		}

		this.setToken(data?.token ?? null);
		return data;
	}

	logout() {
		this.setToken(null);
	}

	isLoggedIn() {
		return !!this.token();
	}
}
