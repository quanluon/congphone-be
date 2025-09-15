import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import routes from "./routes";

// Middleware
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./utils/logger";
import logger from "./utils/logger";
import connectToDatabase from "./config/database";
import { EnvVariables } from "./config/env";
import { optionalAuth } from "./middleware/auth";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/", optionalAuth, routes);

// Error handling middleware
app.use(errorHandler);

// Create handler
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;

  return connectToDatabase()
    .then(() => serverlessHandler(event, context))
    .catch((err) => {
      logger.error("Handler error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: "Internal Server Error",
          data:
            EnvVariables.NODE_ENV === "development" ? err.message : undefined,
        }),
      };
    });
};
