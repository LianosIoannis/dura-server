import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { InvoiceStatus, OrderStatus, PaymentMethod } from "../../prisma/generated/prisma/client";

export class CreateOrderDto {
	@ApiProperty({ enum: OrderStatus, enumName: "OrderStatus" })
	@IsOptional()
	@IsEnum(OrderStatus)
	status?: OrderStatus;

	@IsString()
	@MaxLength(2000)
	problem!: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	technicianNotes?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	intakeNotes?: string;

	// Device info
	@IsOptional()
	@IsString()
	@MaxLength(100)
	deviceType?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	deviceBrand?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	deviceModel?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	serialNumber?: string;

	// Pricing
	@IsOptional()
	@IsNumber()
	@Min(0)
	estimate?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	finalTotal?: number;

	// Invoice
	@ApiPropertyOptional({ enum: InvoiceStatus, enumName: "InvoiceStatus" })
	@IsOptional()
	@IsEnum(InvoiceStatus)
	invoiceStatus?: InvoiceStatus;

	@IsOptional()
	@IsDateString()
	invoiceDueAt?: string;

	@IsOptional()
	@IsDateString()
	invoicePaidAt?: string;

	@ApiPropertyOptional({ enum: PaymentMethod, enumName: "PaymentMethod" })
	@IsOptional()
	@IsEnum(PaymentMethod)
	paymentMethod?: PaymentMethod;

	// Relation
	@IsInt()
	customerId!: number;
}
