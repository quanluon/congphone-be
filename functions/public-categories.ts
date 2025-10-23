import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import { CategoryController } from '../src/controllers/common/category.controller';
import { optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import connectToDatabase from '../layers/common/nodejs/config/database';

const app = express();
const categoryController = new CategoryController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Optional authentication - attaches user if token present

// Public category routes (no authentication required)
app.get('/', categoryController.getCategories.bind(categoryController));
app.get('/active', categoryController.getActiveCategories.bind(categoryController));
app.get('/:id', categoryController.getCategoryById.bind(categoryController));
app.get('/:id/products', categoryController.getCategoryProducts.bind(categoryController));
app.get('/slug/:slug', categoryController.getCategoryBySlug.bind(categoryController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /api/categories prefix
const serverlessHandler = serverless(app, {
  basePath: '/api/categories'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

