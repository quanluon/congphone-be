import mongoose from "mongoose";

import logger from "../utils/logger";
import { EnvVariables } from "./env";

const isProduction = process.env.NODE_ENV === "production";
const READY_STATE_DISCONNECTED = 0;
const READY_STATE_CONNECTED = 1;
const READY_STATE_CONNECTING = 2;
const READY_STATE_DISCONNECTING = 3;

let cachedDb: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 0);

const getConnectionState = () => mongoose.connection.readyState;

const resetConnectionCache = () => {
  cachedDb = null;
  connectionPromise = null;
};

mongoose.connection.on("disconnected", () => {
  resetConnectionCache();
  logger.warn("MongoDB connection disconnected");
});

mongoose.connection.on("error", (error) => {
  resetConnectionCache();
  logger.error({ err: error }, "MongoDB connection emitted an error");
});

export const isDatabaseConnected = () =>
  getConnectionState() === READY_STATE_CONNECTED;

export const getDatabaseConnectionStateLabel = () => {
  switch (getConnectionState()) {
    case READY_STATE_CONNECTED:
      return "connected";
    case READY_STATE_CONNECTING:
      return "connecting";
    case READY_STATE_DISCONNECTING:
      return "disconnecting";
    case READY_STATE_DISCONNECTED:
    default:
      return "disconnected";
  }
};

export async function connectToDatabase() {
  if (cachedDb && isDatabaseConnected()) {
    return cachedDb;
  }

  if (
    connectionPromise &&
    getConnectionState() === READY_STATE_CONNECTING
  ) {
    return connectionPromise;
  }

  resetConnectionCache();

  connectionPromise = mongoose
    .connect(EnvVariables.MONGODB_URI!, {
      dbName: EnvVariables.MONGODB_NAME!,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
    })
    .then((db) => {
      cachedDb = db;
      connectionPromise = null;

      if (!isProduction) {
        logger.info(`Connected to MongoDB: ${EnvVariables.MONGODB_NAME}`);
      }

      return db;
    })
    .catch((error) => {
      resetConnectionCache();
      logger.error({ err: error }, "MongoDB connection error");
      throw error;
    });

  return connectionPromise;
}

export default connectToDatabase;
