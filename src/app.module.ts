import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CustomerModule } from "./customer/customer.module";
import { OrderModule } from "./order/order.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "ui"),
		}),
		UserModule,
		CustomerModule,
		OrderModule,
	],
})
export class AppModule {}
