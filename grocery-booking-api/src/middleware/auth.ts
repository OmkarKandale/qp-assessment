import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../types";

export interface AuthRequest extends Request {
	user?: {
		id: number;
		role: string;
	};
}

export const authMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			res.status(401).json({ message: "Authentication token required" });
			return;
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "your-secret-key"
		) as {
			id: number;
			role: string;
		};

		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid token" });
		return;
	}
};

export const isAdmin = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	if (req.user?.role !== "admin") {
		res.status(403).json({ message: "Admin access required" });
		return;
	}
	next();
};

export const isValidRole = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	if (req.user?.role !== "admin" && req.user?.role !== "user") {
		res.status(403).json({ message: "Unauthorizred role" });
		return;
	}
	next();
};

// Add error handling middleware
export const errorHandler = (
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	console.error("Error:", error);
	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			status: "error",
			error: error.name,
			message: error.message,
		});
		return;
	}

	res.status(500).json({
		status: "error",
		error: "Internal server error",
		message: error.message,
	});
	return;
};
