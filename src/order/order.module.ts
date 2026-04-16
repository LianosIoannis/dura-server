import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserModule } from "../user/user.module";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
	imports: [UserModule],
	controllers: [OrderController],
	providers: [OrderService, PrismaService],
})
export class OrderModule {}
