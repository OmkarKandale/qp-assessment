import { Request, Response, NextFunction } from "express";
import pool from "../config/database";
import { GroceryItem, AppError } from "../types";

export const addGroceryItem = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { name, price, inventory }: Partial<GroceryItem> = req.body;
		if (!name || !price || !inventory)
			throw new AppError(400, "Missing required fields");

		if (price < 0) throw new AppError(400, "Price cannot be negative");

		if (inventory < 0) throw new AppError(400, "Inventory cannot be negative");

		const result = await pool.query(
			"INSERT INTO grocery_items (name, price, inventory) VALUES ($1, $2, $3) RETURNING *",
			[name, price, inventory]
		);

		res.status(201).json(result.rows[0]);
	} catch (error) {
		next(error);
	}
};

export const updateGroceryItem = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;
		const { name, price, inventory }: Partial<GroceryItem> = req.body;

		if (price !== undefined && price < 0)
			throw new AppError(400, "Price cannot be negative");

		if (inventory !== undefined && inventory < 0)
			throw new AppError(400, "Inventory cannot be negative");

		const result = await pool.query(
			"UPDATE grocery_items SET name = COALESCE($1, name), price = COALESCE($2, price), inventory = COALESCE($3, inventory) WHERE id = $4 RETURNING *",
			[name, price, inventory, id]
		);

		if (result.rows.length === 0)
			throw new AppError(404, "Grocery item not found");

		res.json(result.rows[0]);
	} catch (error) {
		next(error);
	}
};
