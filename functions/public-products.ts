import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import { ProductController } from '../src/controllers/common/product.controller';
import { optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import connectToDatabase from '../layers/common/nodejs/config/database';

const app = express();
const productController = new ProductController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Optional authentication - attaches user if token present

// Public product routes (no authentication required)
app.get('/', productController.getProducts);
app.get('/featured', productController.getFeaturedProducts);
app.get('/new', productController.getNewProducts);
app.get('/by-category/:categoryId', productController.getProductsByCategory);
app.get('/by-brand/:brandId', productController.getProductsByBrand);
app.get('/by-type/:productType', productController.getProductsByType);
app.get('/:id', productController.getProductById);
app.get('/:id/variants', productController.getProductVariants);
app.get('/:id/related', productController.getRelatedProducts);

// Product filtering and sorting
app.get('/filter/price-range', productController.getPriceRange);
app.get('/filter/colors', productController.getAvailableColors);
app.get('/filter/storage-options', productController.getStorageOptions);

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /api/products prefix
const serverlessHandler = serverless(app, {
  basePath: '/api/products'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

