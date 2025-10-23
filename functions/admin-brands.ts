import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import connectToDatabase from '../layers/common/nodejs/config/database';
import { adminOnly, requiredAuth, optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import { validate, validateRequest } from '../layers/common/nodejs/middleware/validate';
import {
    createBrandSchema,
    listBrandsSchema,
    updateBrandSchema,
} from '../layers/common/nodejs/validators/brand.validator';
import { adminBrandController } from '../src/controllers/admin/brand.controller';

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

// Admin brand management routes
app.post('/', validateRequest(createBrandSchema), adminBrandController.createBrand.bind(adminBrandController));
app.get('/', validate({ query: listBrandsSchema }), adminBrandController.listBrands.bind(adminBrandController));
app.get('/active', adminBrandController.getAllActiveBrands.bind(adminBrandController));
app.get('/:id', adminBrandController.getBrand.bind(adminBrandController));
app.put('/:id', validateRequest(updateBrandSchema), adminBrandController.updateBrand.bind(adminBrandController));
app.delete('/:id', adminBrandController.deleteBrand.bind(adminBrandController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /admin/brands prefix
const serverlessHandler = serverless(app, {
  basePath: '/admin/brands'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

