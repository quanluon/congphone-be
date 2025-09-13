import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

let cachedDb: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return mongoose
    .connect(process.env.MONGODB_URI!)
    .then(db => {
      cachedDb = db;
      logger.info('Connected to MongoDB');
      return cachedDb;
    })
    .catch(err => {
      logger.error('MongoDB connection error:', err);
      throw err;
    });
}

export default connectToDatabase;
