import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import { AppError } from "../types";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { email, password, role = "user" } = req.body;
		if (!email || email.trim() === "" || !password || password.trim() === "")
			throw new AppError(400, "Email and password are required");

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email))
			throw new AppError(400, "Invalid email format");

		if (password.length < 8)
			throw new AppError(400, "Password must be at least 8 characters long");

		const existingUser = await pool.query(
			"SELECT id FROM users WHERE email = $1",
			[email]
		);

		if (existingUser.rows.length > 0)
			throw new AppError(409, "User already exists");

		const hashedPassword = await hash(password, SALT_ROUNDS);
		const result = await pool.query(
			"INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
			[email, hashedPassword, role]
		);

		const user = result.rows[0];
		const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: "24h",
		});

		res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			throw new AppError(400, "Email and password are required");

		const result = await pool.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);

		if (result.rows.length === 0)
			throw new AppError(401, "Invalid credentials");

		const user = result.rows[0];
		const isValidPassword = await compare(password, user.password);
		if (!isValidPassword) throw new AppError(401, "Invalid credentials");

		const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: "24h",
		});

		res.json({
			message: "Login successful",
			token,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		next(error);
	}
};
