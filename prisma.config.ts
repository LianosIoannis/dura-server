import process from "node:process";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config();

const db = process.env.DATABASE_URL;
if (!db) {
	throw new Error("DATABASE_URL environment variable is not set.");
}

export default defineConfig({
	schema: "prisma/schema/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: db,
	},
});
