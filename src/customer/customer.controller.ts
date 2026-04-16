/** biome-ignore-all lint/style/useImportType: <nest> */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";
import { UserGuard } from "../user/user.guard";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@UseGuards(UserGuard)
@Controller("customer")
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Get("get/:id")
	async getById(@Param("id", ParseIntPipe) id: number) {
		return await this.customerService.getById(id);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Get("all")
	async getAll() {
		return await this.customerService.getAll();
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Post("create")
	async create(@Body() createCustomerDto: CreateCustomerDto) {
		return await this.customerService.create(createCustomerDto);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Patch("update/:id")
	async update(@Param("id", ParseIntPipe) id: number, @Body() updateCustomerDto: UpdateCustomerDto) {
		return await this.customerService.update(id, updateCustomerDto);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Delete("delete/:id")
	async delete(@Param("id", ParseIntPipe) id: number) {
		return await this.customerService.delete(id);
	}
}
