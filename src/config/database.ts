import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";
import { EnvVariables } from "./env";

dotenv.config();

let cachedDb: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return mongoose
    .connect(EnvVariables.MONGODB_URI!, { dbName: EnvVariables.MONGODB_NAME! })
    .then((db) => {
      cachedDb = db;
      logger.info(`Connected to MongoDB: ${EnvVariables.MONGODB_NAME}`);
      return cachedDb;
    })
    .catch((err) => {
      logger.error("MongoDB connection error:", err);
      throw err;
    });
}

export default connectToDatabase;
