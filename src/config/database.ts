import mongoose from "mongoose";
import logger from "../utils/logger";
import { EnvVariables } from "./env";

const isProduction = process.env.NODE_ENV === "production";

let cachedDb: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(EnvVariables.MONGODB_URI!, { dbName: EnvVariables.MONGODB_NAME! })
    .then((db) => {
      cachedDb = db;
      connectionPromise = null;
      // Only log connection success in development
      if (!isProduction) {
        logger.info(`Connected to MongoDB: ${EnvVariables.MONGODB_NAME}`);
      }
      return cachedDb;
    })
    .catch((err) => {
      connectionPromise = null;
      logger.error("MongoDB connection error:", err);
      throw err;
    });

  return connectionPromise;
}

export default connectToDatabase;
