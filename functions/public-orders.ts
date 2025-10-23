import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import { OrderController } from '../src/controllers/common/order.controller';
import { requiredAuth, optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { validate, validateRequest } from '../layers/common/nodejs/middleware/validate';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import connectToDatabase from '../layers/common/nodejs/config/database';
import {
  createOrderSchema,
  getOrdersSchema,
  orderIdSchema,
  orderNumberSchema,
} from '../layers/common/nodejs/validators/order.validator';

const app = express();
const orderController = new OrderController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Optional authentication - attaches user if token present

// Public routes
app.post('/', validateRequest(createOrderSchema), orderController.createOrder.bind(orderController));

// Protected routes
app.get('/number/:orderNumber', requiredAuth, validate({ params: orderNumberSchema }), orderController.getOrderByNumber.bind(orderController));
app.get('/', requiredAuth, validate({ query: getOrdersSchema }), orderController.getUserOrders.bind(orderController));
app.get('/:id', requiredAuth, validate({ params: orderIdSchema }), orderController.getOrderById.bind(orderController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /api/orders prefix
const serverlessHandler = serverless(app, {
  basePath: '/api/orders'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

