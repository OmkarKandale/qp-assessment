export interface GroceryItem {
	id: number;
	name: string;
	price: number;
	inventory: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Order {
	id: number;
	userId: number;
	items: OrderItem[];
	totalAmount: number;
	createdAt: Date;
}

export interface OrderItem {
	groceryItemId: number;
	quantity: number;
	price: number;
}

export interface User {
	id: number;
	email: string;
	password: string;
	role: "admin" | "user";
	createdAt: Date;
}

export class AppError extends Error {
	constructor(public statusCode: number, message: string) {
		super(message);
		this.name = "AppError";
		Object.setPrototypeOf(this, AppError.prototype);
	}
}
