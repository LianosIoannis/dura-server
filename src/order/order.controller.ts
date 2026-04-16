/** biome-ignore-all lint/style/useImportType: <nest> */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";
import { UserGuard } from "../user/user.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderService } from "./order.service";

@UseGuards(UserGuard)
@Controller("order")
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Post("create")
	async create(@Body() createOrderDto: CreateOrderDto) {
		return await this.orderService.create(createOrderDto);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Get("get/:id")
	async getById(@Param("id", ParseIntPipe) id: number) {
		return await this.orderService.getById(id);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Get("all")
	async getAll() {
		return await this.orderService.getAll();
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Patch("update/:id")
	async update(@Param("id", ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
		return await this.orderService.update(id, updateOrderDto);
	}

	@ApiHeader({ name: "Authorization", description: "Bearer token", required: true })
	@Delete("delete/:id")
	async delete(@Param("id", ParseIntPipe) id: number) {
		return await this.orderService.delete(id);
	}
}
