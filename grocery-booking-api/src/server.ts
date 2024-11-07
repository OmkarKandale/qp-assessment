import app from "./app";
import { checkDatabaseConnection, initializeDatabase } from "./config/database";

const PORT = process.env.PORT || 3333;

const startServer = async () => {
	try {
		// Check database connection before starting server
		const isDbConnected = await checkDatabaseConnection();
		if (!isDbConnected) {
			console.error("Unable to connect to the database. Exiting...");
			process.exit(1);
		}

		await initializeDatabase();

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting server:", error);
		process.exit(1);
	}
};

process.on("unhandledRejection", (error) => {
	console.error("Unhandled rejection:", error);
	process.exit(1);
});

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
	process.exit(1);
});

startServer();
