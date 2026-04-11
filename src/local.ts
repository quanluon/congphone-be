import dotenv from "dotenv";
dotenv.config();

import { execSync } from "child_process";
import app from "./app";
import { prepareRuntime } from "./bootstrap";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3001;

const killPort = (port: number | string) => {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
    logger.info(`Successfully killed existing process on port ${port}`);
  } catch (error) {
    // Ignore error if port is already free
  }
};

prepareRuntime()
  .then(() => {
    killPort(PORT);
    app.listen(PORT, () => {
      logger.info(`Server is running locally on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    logger.error("Failed to start server locally", err);
    process.exit(1);
  });
