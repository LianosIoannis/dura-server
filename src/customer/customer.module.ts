import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserModule } from "../user/user.module";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";

@Module({
	imports: [UserModule],
	controllers: [CustomerController],
	providers: [CustomerService, PrismaService],
})
export class CustomerModule {}
