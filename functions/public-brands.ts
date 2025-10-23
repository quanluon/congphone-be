import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import { BrandController } from '../src/controllers/common/brand.controller';
import { optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import connectToDatabase from '../layers/common/nodejs/config/database';

const app = express();
const brandController = new BrandController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Optional authentication - attaches user if token present

// Public brand routes (no authentication required)
app.get('/', brandController.getBrands.bind(brandController));
app.get('/active', brandController.getActiveBrands.bind(brandController));
app.get('/:id', brandController.getBrandById.bind(brandController));
app.get('/:id/products', brandController.getBrandProducts.bind(brandController));
app.get('/slug/:slug', brandController.getBrandBySlug.bind(brandController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /api/brands prefix
const serverlessHandler = serverless(app, {
  basePath: '/api/brands'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

