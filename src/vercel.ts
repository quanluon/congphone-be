import express, { Request, Response } from "express";

import app from "./app";
import { getRuntimeErrorPayload, prepareRuntime } from "./bootstrap";
import logger from "./utils/logger";

export const createVercelApp = () => {
  const vercelApp = express();

  vercelApp.use(async (_req, res, next) => {
    try {
      await prepareRuntime();
      next();
    } catch (error) {
      logger.error({ err: error }, "Vercel runtime initialization failed");
      res.status(500).json(getRuntimeErrorPayload(error));
    }
  });

  vercelApp.use(app);

  return vercelApp;
};

export const vercelApp = createVercelApp();

export const vercelHandler = (req: Request, res: Response) =>
  vercelApp(req, res);

export default vercelApp;
