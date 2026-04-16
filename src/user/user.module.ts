import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserController } from "./user.controller";
import { UserGuard } from "./user.guard";
import { UserService } from "./user.service";

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaService, UserGuard],
	exports: [UserGuard, UserService],
})
export class UserModule {}
