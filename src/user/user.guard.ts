/** biome-ignore-all lint/style/useImportType: <nest> */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { UserService } from "./user.service";

type RequestWithUser = Request & {
	user?: {
		id: number;
		name: string;
		email: string;
		isActive: boolean;
	};
};

@Injectable()
export class UserGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			throw new UnauthorizedException("Missing Authorization header");
		}

		const [type, token] = authHeader.split(" ");

		if (type !== "Bearer" || !token) {
			throw new UnauthorizedException("Invalid authorization format");
		}

		const user = await this.userService.getUserFromToken(token);

		if (!user) {
			throw new UnauthorizedException("Invalid or expired token");
		}

		request.user = user;
		return true;
	}
}
