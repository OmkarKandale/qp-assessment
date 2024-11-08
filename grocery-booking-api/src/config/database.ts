import * as fs from "fs";
import * as path from "path";
import { Pool, PoolConfig } from "pg";

const config: PoolConfig = {
	user: process.env.DB_USER || "postgres",
	host: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "grocery_db",
	password: process.env.DB_PASSWORD || "postgres",
	port: parseInt(process.env.DB_PORT || "5432"),
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});

// Add basic health check query
export const checkDatabaseConnection = async (): Promise<boolean> => {
	try {
		const client = await pool.connect();
		try {
			await client.query("SELECT 1");
			return true;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error("Database connection error:", error);
		return false;
	}
};

export const initializeDatabase = async () => {
	try {
		const sql = fs.readFileSync(
			path.join(__dirname, process.env.DB_SCRIPT || "../init.sql"),
			"utf8"
		);
		await pool.query(sql);
		console.log("Database initialized successfully.");
	} catch (error) {
		console.error("Error initializing database:", error);
		throw error;
	}
};

export default pool;
