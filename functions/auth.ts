import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import connectToDatabase from '../layers/common/nodejs/config/database';
import { adminOnly, requiredAuth, optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import { validate } from '../layers/common/nodejs/middleware/validate';
import {
    changePasswordSchema,
    confirmForgotPasswordSchema,
    forgotPasswordSchema,
    getAllUsersSchema,
    loginSchema,
    refreshTokenSchema,
    registerSchema,
    updateProfileSchema,
} from '../layers/common/nodejs/validators/auth.validator';
import { AuthController } from '../src/controllers/auth.controller';

const app = express();
const authController = new AuthController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Optional authentication for all routes

// Public routes
app.post('/register', validate({ body: registerSchema }), authController.registerPublic);
app.post('/login', validate({ body: loginSchema }), authController.login);
app.post('/refresh', validate({ body: refreshTokenSchema }), authController.refreshToken);
app.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
app.post('/reset-password', validate({ body: confirmForgotPasswordSchema }), authController.confirmForgotPassword);
app.post('/social-login', authController.socialLogin);

// Protected routes
app.post('/logout', requiredAuth, authController.logout);
app.get('/profile', requiredAuth, authController.getProfile);
app.put('/profile', requiredAuth, validate({ body: updateProfileSchema }), authController.updateProfile.bind(authController));
app.put('/change-password', requiredAuth, validate({ body: changePasswordSchema }), authController.changePassword);

// Admin routes
app.post('/admin/register', requiredAuth, adminOnly, validate({ body: registerSchema }), authController.register);
app.get('/users', requiredAuth, adminOnly, validate({ query: getAllUsersSchema }), authController.getAllUsers);
app.get('/users/:id', requiredAuth, adminOnly, authController.getUserById);
app.delete('/users/:email', requiredAuth, adminOnly, authController.deactivateUser);

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /auth prefix
const serverlessHandler = serverless(app, {
  basePath: '/auth'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};
