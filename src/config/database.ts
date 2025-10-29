import mongoose from "mongoose";
import logger from "../utils/logger";
import { EnvVariables } from "./env";

const isProduction = process.env.NODE_ENV === 'production';


let cachedDb: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return mongoose
    .connect(EnvVariables.MONGODB_URI!, { dbName: EnvVariables.MONGODB_NAME! })
    .then((db) => {
      cachedDb = db;
      // Only log connection success in development
      if (!isProduction) {
        logger.info(`Connected to MongoDB: ${EnvVariables.MONGODB_NAME}`);
      }
      return cachedDb;
    })
    .catch((err) => {
      logger.error("MongoDB connection error:", err);
      throw err;
    });
}

export default connectToDatabase;
