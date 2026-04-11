import mongoose from "mongoose";
import logger from "../utils/logger";
import { EnvVariables } from "./env";

const isProduction = process.env.NODE_ENV === "production";
const READY_STATE_CONNECTED = 1;
const READY_STATE_CONNECTING = 2;

let cachedDb: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 0);

// export async function connectToDatabase() {
//   if (
//     cachedDb &&
//     mongoose.connection.readyState === READY_STATE_CONNECTED
//   ) {
//     return Promise.resolve(cachedDb);
//   }

//   if (
//     connectionPromise &&
//     mongoose.connection.readyState === READY_STATE_CONNECTING
//   ) {
//     return connectionPromise;
//   }

//   cachedDb = null;
//   connectionPromise = null;

//   connectionPromise = mongoose
//     .connect(EnvVariables.MONGODB_URI!, {
//       dbName: EnvVariables.MONGODB_NAME!,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 10000,
//       maxPoolSize: 10,
//     })
//     .then((db) => {
//       cachedDb = db;
//       connectionPromise = null;
//       // Only log connection success in development
//       if (!isProduction) {
//         logger.info(`Connected to MongoDB: ${EnvVariables.MONGODB_NAME}`);
//       }
//       return cachedDb;
//     })
//     .catch((err) => {
//       connectionPromise = null;
//       cachedDb = null;
//       logger.error("MongoDB connection error:", err);
//       throw err;
//     });

//   return connectionPromise;
// }



export async function connectToDatabase() {
  return mongoose
    .connect(EnvVariables.MONGODB_URI!, {
      dbName: EnvVariables.MONGODB_NAME!,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
    })
    .then((db) => {
      // Only log connection success in development
      if (!isProduction) {
        logger.info(`Connected to MongoDB: ${EnvVariables.MONGODB_NAME}`);
      }
      return db;
    })
    .catch((err) => {
      connectionPromise = null;
      cachedDb = null;
      logger.error("MongoDB connection error:", err);
      throw err;
    });

}

export default connectToDatabase;
