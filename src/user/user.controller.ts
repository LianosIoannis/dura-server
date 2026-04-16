/** biome-ignore-all lint/style/useImportType: <nest> */
import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { UserGuard } from "./user.guard";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post("signup")
	async signup(@Body() dto: SignupDto) {
		return await this.userService.signup(dto);
	}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: LoginDto) {
		return await this.userService.login(dto);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Get("all")
	@UseGuards(UserGuard)
	async findAll() {
		return await this.userService.findAll();
	}
}
