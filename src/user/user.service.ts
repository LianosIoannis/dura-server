/** biome-ignore-all lint/style/useImportType: <nest> */
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { SignupDto } from "./dto/signup.dto";

@Injectable()
export class UserService {
	private readonly tokenSecret: string;

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {
		this.tokenSecret = this.config.getOrThrow<string>("JWT_SECRET");
	}

	async findAll() {
		return await this.prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async getUserFromToken(token: string) {
		try {
			const { payload } = await jwtVerify(token, new TextEncoder().encode(this.tokenSecret));

			const userId = Number(payload.sub);

			const user = await this.prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					name: true,
					email: true,
					isActive: true,
				},
			});

			return user || null;
		} catch {
			return null;
		}
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: {
				id: true,
				name: true,
				email: true,
				passwordHash: true,
				isActive: true,
			},
		});

		if (!user) {
			throw new UnauthorizedException(`Email #${dto.email} not found`);
		}

		if (!user.isActive) {
			throw new UnauthorizedException(`Email #${dto.email} is inactive`);
		}

		const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

		if (!passwordMatch) {
			throw new UnauthorizedException(`Invalid password for email #${dto.email}`);
		}

		const token = await this.generateJwt(user.id);

		return { id: user.id, name: user.name, email: user.email, token };
	}

	async signup(dto: SignupDto) {
		const passwordHash = await bcrypt.hash(dto.password, 10);

		const existingUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingUser) {
			throw new ConflictException(`Email #${dto.email} already exists`);
		}

		return await this.prisma.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				passwordHash,
			},
			select: {
				id: true,
				name: true,
				email: true,
				isActive: true,
				createdAt: true,
			},
		});
	}

	private async generateJwt(userId: number) {
		const jwt = new SignJWT({ userId })
			.setProtectedHeader({ alg: "HS256", typ: "JWT" })
			.setSubject(userId.toString())
			.setIssuedAt()
			.setExpirationTime("24h");

		return await jwt.sign(new TextEncoder().encode(this.tokenSecret));
	}
}
