import cors from "cors";
import express from "express";

import "./config/database";
import { EnvVariables } from "./config/env";
import { ensureDatabaseConnection } from "./bootstrap";
import { optionalAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import routes from "./routes";
import logger, { requestLogger } from "./utils/logger";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || EnvVariables.ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-amz-acl", "x-api-key"],
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(requestLogger);

  app.use(async (req, _res, next) => {
    try {
      await ensureDatabaseConnection();
      next();
    } catch (error) {
      next(error);
    }
  });

  app.use("/", optionalAuth, routes);
  app.use(errorHandler);

  logger.debug(
    { allowedOrigins: EnvVariables.ALLOWED_ORIGINS },
    "Express app initialized"
  );

  return app;
};

const app = createApp();

export default app;
