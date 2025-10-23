import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import connectToDatabase from '../layers/common/nodejs/config/database';
import { adminOnly, requiredAuth, optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import { validate, validateRequest } from '../layers/common/nodejs/middleware/validate';
import {
    bulkUpdateOrdersSchema,
    getOrdersSchema,
    orderIdSchema,
    updateOrderSchema,
} from '../layers/common/nodejs/validators/order.validator';
import { AdminOrderController } from '../src/controllers/admin/order.controller';

const app = express();
const adminOrderController = new AdminOrderController();

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

// Order management routes
app.get('/', validate({ query: getOrdersSchema }), adminOrderController.getOrders.bind(adminOrderController));
app.get('/stats', adminOrderController.getOrderStats.bind(adminOrderController));
app.get('/:id', validate({ params: orderIdSchema }), adminOrderController.getOrderById.bind(adminOrderController));
app.put('/:id', validate({ params: orderIdSchema }), validateRequest(updateOrderSchema), adminOrderController.updateOrder.bind(adminOrderController));
app.delete('/:id', validate({ params: orderIdSchema }), adminOrderController.deleteOrder.bind(adminOrderController));
app.put('/bulk-update', validateRequest(bulkUpdateOrdersSchema), adminOrderController.bulkUpdateOrders.bind(adminOrderController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /admin/orders prefix
const serverlessHandler = serverless(app, {
  basePath: '/admin/orders'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

