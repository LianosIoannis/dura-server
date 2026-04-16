/** biome-ignore-all lint/style/useImportType: <nest> */
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomerService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createCustomerDto: CreateCustomerDto) {
		const existingCustomer = await this.prisma.customer.findUnique({
			where: { email: createCustomerDto.email },
		});

		if (existingCustomer) {
			throw new ConflictException("Customer with this email already exists");
		}

		return await this.prisma.customer.create({
			data: createCustomerDto,
			select: {
				id: true,
				name: true,
				email: true,
				address: true,
				notes: true,
				phone: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async update(id: number, updateCustomerDto: UpdateCustomerDto) {
		const existingCustomer = await this.prisma.customer.findUnique({
			where: { id },
		});

		if (!existingCustomer) {
			throw new NotFoundException("Customer not found");
		}

		return await this.prisma.customer.update({
			where: { id },
			data: updateCustomerDto,
			select: {
				id: true,
				name: true,
				email: true,
				address: true,
				notes: true,
				phone: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async delete(id: number) {
		const existingCustomer = await this.prisma.customer.findUnique({
			where: { id },
		});

		if (!existingCustomer) {
			throw new NotFoundException("Customer not found");
		}

		const existsingOrders = await this.prisma.order.findFirst({
			where: { customerId: id },
		});

		if (existsingOrders) {
			throw new ConflictException("Cannot delete customer with existing orders");
		}

		return await this.prisma.customer.delete({
			where: { id },
		});
	}

	async getById(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				address: true,
				notes: true,
				phone: true,
				createdAt: true,
				updatedAt: true,
				orders: true,
			},
		});

		if (!customer) {
			throw new NotFoundException("Customer not found");
		}

		return customer;
	}

	async getAll() {
		return await this.prisma.customer.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				address: true,
				notes: true,
				phone: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}
}
