import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import '../layers/common/nodejs/models'; // Import all models to ensure registration
import connectToDatabase from '../layers/common/nodejs/config/database';
import { optionalAuth } from '../layers/common/nodejs/middleware/auth';
import { errorHandler } from '../layers/common/nodejs/middleware/error';
import { FileUploadController } from '../src/controllers/fileUpload.controller';

const app = express();
const fileUploadController = new FileUploadController();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(optionalAuth); // Optional authentication - attaches user if token present

// File operations
app.post('/upload-url', fileUploadController.getPresignedUrl.bind(fileUploadController));
app.post('/upload-urls', fileUploadController.getMultiplePresignedUrls.bind(fileUploadController));
app.delete('/delete', fileUploadController.deleteFile.bind(fileUploadController));
app.get('/info/:fileKey', fileUploadController.getFileInfo.bind(fileUploadController));
app.post('/move-permanent', fileUploadController.moveToPermanent.bind(fileUploadController));
app.post('/move-multiple-permanent', fileUploadController.moveMultipleToPermanent.bind(fileUploadController));

// Error handling
app.use(errorHandler);

// Create serverless handler with basePath to strip /files prefix
const serverlessHandler = serverless(app, {
  basePath: '/files'
});

export const handler = async (event: unknown, context: unknown) => {
  (context as { callbackWaitsForEmptyEventLoop: boolean }).callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverlessHandler(event, context);
};

