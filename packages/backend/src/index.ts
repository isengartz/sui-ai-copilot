import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
// @ts-ignore - Morgan types are not available
import morgan from "morgan";
import dotenv from "dotenv";
import { ApiEndpoint } from "@sui-ai-copilot/shared";

// Load environment variables
dotenv.config();

// Import routes
import transactionRoutes from "./routes/transaction";
import healthRoutes from "./routes/health";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

// Create Express app
const app: Application = express();
const port = process.env.PORT || 3000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // JSON body parser
app.use(morgan("combined")); // HTTP request logging
app.use(requestLogger); // Custom request logging

// Apply routes
app.use(ApiEndpoint.EXPLAIN_TRANSACTION.split("/")[1], transactionRoutes);
app.use(ApiEndpoint.HEALTH_CHECK.split("/")[1], healthRoutes);

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Health check endpoint: ${ApiEndpoint.HEALTH_CHECK}`);
  console.log(
    `Transaction explanation endpoint: ${ApiEndpoint.EXPLAIN_TRANSACTION}`
  );
});

export default app;
