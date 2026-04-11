/**
 * Centralized logging configuration for CloudWatch cost optimization
 * This file manages log levels and sampling rates for different environments
 */

export const LOGGING_CONFIG = {
  // Production log levels - minimize CloudWatch costs
  production: {
    level: 'info', // Increased log level to capture info
    requestSampling: 1.0, // Log all successful requests
    errorSampling: 1.0, // Always log errors
    slowRequestThreshold: 1000,
    skipPaths: []
  },
  
  // Development log levels - full logging for debugging
  development: {
    level: 'debug',
    requestSampling: 1.0, // Log all requests
    errorSampling: 1.0,
    slowRequestThreshold: 500,
    skipPaths: []
  },
  
  // Test log levels - minimal logging
  test: {
    level: 'error',
    requestSampling: 1.0, 
    errorSampling: 1.0,
    slowRequestThreshold: 2000,
    skipPaths: []
  }
} as const;

export const getLoggingConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return LOGGING_CONFIG[env as keyof typeof LOGGING_CONFIG] || LOGGING_CONFIG.development;
};

export const shouldLogRequest = (path: string, statusCode: number, duration: number) => {
  const config = getLoggingConfig();
  
  // Skip logging for specific paths
  if (config.skipPaths.some(skipPath => path.includes(skipPath))) {
    return false;
  }
  
  // Always log errors and slow requests
  if (statusCode >= 400 || duration > config.slowRequestThreshold) {
    return true;
  }
  
  // Sample successful requests
  return Math.random() < config.requestSampling;
};

export const shouldLogInfo = () => {
  const config = getLoggingConfig();
  return config.level === 'debug' || config.level === 'info';
};
