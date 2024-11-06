import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/auth";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use(errorHandler);

app.use((_req, res) => {
	res.status(404).json({ message: "Route not found" });
});

export default app;
