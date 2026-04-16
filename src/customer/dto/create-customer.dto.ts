import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCustomerDto {
	@IsString()
	@MaxLength(255)
	name!: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	phone?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	address?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	notes?: string;
}
