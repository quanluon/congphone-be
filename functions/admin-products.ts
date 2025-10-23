import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import connectToDatabase from '../layers/common/nodejs/config/database';
import { adminOnly, requiredAuth, optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import { validate, validateRequest } from '../layers/common/nodejs/middleware/validate';
import {
    bulkDeleteSchema,
    bulkUpdateSchema,
    createProductSchema,
    listProductsSchema,
    updateProductSchema,
    updateStatusSchema,
} from '../layers/common/nodejs/validators/admin/product.validator';
import { AdminProductController } from '../src/controllers/admin/product.controller';

const app = express();
const adminProductController = new AdminProductController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Check for authentication
app.use(requiredAuth); // Require authentication
app.use(adminOnly); // Require admin role

// Product CRUD operations
app.get('/', validate({ query: listProductsSchema }), adminProductController.getProducts.bind(adminProductController));
app.get('/stats', adminProductController.getProductStats.bind(adminProductController));
app.get('/:id', adminProductController.getProductById.bind(adminProductController));
app.post('/', validateRequest(createProductSchema), adminProductController.createProduct.bind(adminProductController));
app.put('/:id', validateRequest(updateProductSchema), adminProductController.updateProduct.bind(adminProductController));
app.delete('/:id', adminProductController.deleteProduct.bind(adminProductController));
app.delete('/:id/hard', adminProductController.hardDeleteProduct.bind(adminProductController));

// Bulk operations
app.put('/bulk/update', validateRequest(bulkUpdateSchema), adminProductController.bulkUpdateProducts.bind(adminProductController));
app.delete('/bulk/delete', validateRequest(bulkDeleteSchema), adminProductController.bulkDeleteProducts.bind(adminProductController));

// Product status and feature management
app.patch('/:id/status', validateRequest(updateStatusSchema), adminProductController.updateProductStatus.bind(adminProductController));
app.patch('/:id/featured', adminProductController.toggleFeatured.bind(adminProductController));
app.patch('/:id/new', adminProductController.toggleNew.bind(adminProductController));

// Product variants management
app.get('/:id/variants', adminProductController.getProductVariants.bind(adminProductController));
app.put('/:id/variants', adminProductController.updateProductVariants.bind(adminProductController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /admin/products prefix
const serverlessHandler = serverless(app, {
  basePath: '/admin/products'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};
