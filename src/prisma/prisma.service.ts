/** biome-ignore-all lint/style/useImportType: <nest> */
import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// biome-ignore lint/correctness/noUnusedPrivateClassMembers: <nest>
	constructor(private readonly config: ConfigService) {
		const url = config.getOrThrow<string>("DATABASE_URL");

		const adapter = new PrismaBetterSqlite3({ url });

		super({ adapter });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
