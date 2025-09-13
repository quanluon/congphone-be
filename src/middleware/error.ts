import { Request, Response, NextFunction } from "express";
import { ApiResponse, ApiError } from "../utils/ApiResponse";
import { getMessage } from "../utils/messages";
import logger from "../utils/logger";
import { EnvVariables } from "../config/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(
    JSON.stringify({
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })
  );

  if (err instanceof ApiError) {
    const language = (req.headers['accept-language'] as string)?.includes('vi') ? 'vi' : 'en';
    const message = err.msgCode ? getMessage(err.msgCode as any, language) : err.message;
    return res
      .status(err.statusCode)
      .json(ApiResponse.error(message, err.data).build());
  }

  const language = (req.headers['accept-language'] as string)?.includes('vi') ? 'vi' : 'en';

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json(ApiResponse.error(getMessage('validationError', language), err).build());
  }

  // MongoDB duplicate key error
  if (err.name === "MongoError" && (err as any).code === 11000) {
    return res
      .status(409)
      .json(ApiResponse.error(getMessage('error', language), err).build());
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res
      .status(401)
      .json(ApiResponse.error(getMessage('unauthorized', language), err).build());
  }

  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json(ApiResponse.error(getMessage('tokenExpired', language), err).build());
  }

  // Default error
  return res
    .status(500)
    .json(
      ApiResponse.error(
        err?.message || getMessage('internalError', language),
        EnvVariables.NODE_ENV === "development" ? err : undefined
      ).build()
    );
};
