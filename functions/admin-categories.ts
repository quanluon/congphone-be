import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import { adminCategoryController } from '../src/controllers/admin/category.controller';
import { adminOnly, requiredAuth, optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { validate, validateRequest } from '../layers/common/nodejs/middleware/validate';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import connectToDatabase from '../layers/common/nodejs/config/database';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
} from '../layers/common/nodejs/validators/category.validator';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Check for authentication
app.use(requiredAuth); // Require authentication
app.use(adminOnly); // Require admin role

// Admin category management routes
app.post('/', validateRequest(createCategorySchema), adminCategoryController.createCategory.bind(adminCategoryController));
app.get('/', validate({ query: listCategoriesSchema }), adminCategoryController.listCategories.bind(adminCategoryController));
app.get('/:id', adminCategoryController.getCategory.bind(adminCategoryController));
app.put('/:id', validateRequest(updateCategorySchema), adminCategoryController.updateCategory.bind(adminCategoryController));
app.delete('/:id', adminCategoryController.deleteCategory.bind(adminCategoryController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /admin/categories prefix
const serverlessHandler = serverless(app, {
  basePath: '/admin/categories'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

