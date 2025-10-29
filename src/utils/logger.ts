import pino from 'pino';
import { Request, Response, NextFunction } from 'express';
import { getLoggingConfig, shouldLogRequest } from '../config/logging';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const loggingConfig = getLoggingConfig();

// Create Pino logger with optimized configuration for CloudWatch cost reduction
const logger = pino({
  level: process.env.LOG_LEVEL || loggingConfig.level,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined, // In production, output raw JSON for log aggregation
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Reduce log size by removing unnecessary fields in production
  ...(isProduction && {
    base: {
      pid: false,
      hostname: false,
    },
  }),
});

// HTTP request logger middleware with CloudWatch cost optimization
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;
    const isSlow = duration > loggingConfig.slowRequestThreshold;
    
    // Use centralized configuration for logging decisions
    if (shouldLogRequest(req.path, res.statusCode, duration)) {
      const logLevel = isError ? 'error' : 'warn';
      const logData = {
        type: 'response',
        method: req.method,
        url: req.url,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ...(isSlow && { slow: true }),
      };
      
      logger[logLevel](logData, `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
};

export default logger;
