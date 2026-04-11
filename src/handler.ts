import serverless from "serverless-http";

import { getRuntimeErrorPayload, prepareRuntime } from "./bootstrap";
import app from "./app";
import logger from "./utils/logger";

// Create handler
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;

  return prepareRuntime()
    .then(() => serverlessHandler(event, context))
    .catch((err) => {
      logger.error("Handler error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify(getRuntimeErrorPayload(err)),
      };
    });
};
