import { Request, Response, NextFunction } from "express";
import pool from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { OrderItem, AppError } from "../types";

export const getGroceryItems = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const result = await pool.query(
			"SELECT * FROM grocery_items WHERE inventory > 0"
		);
		res.json(result.rows);
	} catch (error) {
		next(error);
	}
};

export const createOrder = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const { items }: { items: OrderItem[] } = req.body;
		if (!items || items.length === 0) {
			throw new AppError(400, "No items in order");
		}

		const userId = req.user?.id;
		if (!userId) {
			throw new AppError(401, "User not authenticated");
		}

		let totalAmount = 0;

		for (const item of items) {
			if (item.quantity <= 0)
				throw new AppError(
					400,
					`Invalid quantity for item ${item.groceryItemId}`
				);

			const result = await client.query(
				"SELECT price, inventory FROM grocery_items WHERE id = $1 FOR UPDATE",
				[item.groceryItemId]
			);

			if (result.rows.length === 0)
				throw new AppError(404, `Item ${item.groceryItemId} not found`);

			const { price, inventory } = result.rows[0];
			if (inventory < item.quantity)
				throw new AppError(
					400,
					`Insufficient inventory for item ${item.groceryItemId}`
				);

			totalAmount += price * item.quantity;
			await client.query(
				"UPDATE grocery_items SET inventory = inventory - $1 WHERE id = $2",
				[item.quantity, item.groceryItemId]
			);
		}

		const orderResult = await client.query(
			"INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id",
			[userId, totalAmount]
		);

		const orderId = orderResult.rows[0].id;
		for (const item of items)
			await client.query(
				"INSERT INTO order_items (order_id, grocery_item_id, quantity, price) VALUES ($1, $2, $3, $4)",
				[orderId, item.groceryItemId, item.quantity, item.price]
			);

		await client.query("COMMIT");
		res.status(201).json({ orderId, totalAmount });
	} catch (error) {
		await client.query("ROLLBACK");
		next(error);
	} finally {
		client.release();
	}
};
