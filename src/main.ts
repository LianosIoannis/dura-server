import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	const config = new DocumentBuilder()
		.setTitle("Service API")
		.setDescription("API for the service")
		.setVersion("1.0")
		.addTag("api")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("api", app, documentFactory);

	const configService = app.get(ConfigService);
	const port = configService.getOrThrow<number>("PORT");

	await app.listen(port);
}
bootstrap();
