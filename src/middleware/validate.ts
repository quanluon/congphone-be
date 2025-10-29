import { Request, Response, NextFunction } from "express";
import { Schema, ValidationOptions } from "joi";
import { ApiError } from "../utils/ApiResponse";
import logger from "../utils/logger";

const isProduction = process.env.NODE_ENV === 'production';

type ValidationType = 'body' | 'query' | 'params';
type ValidationSchema = {
  [key in ValidationType]?: Schema;
};

export const validate = (schemas: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions: ValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
    };

    try {
      // Validate each part of the request separately
      Object.entries(schemas).forEach(([key, schema]) => {
        if (!schema) return;

        const { error, value } = schema.validate(
          req[key as ValidationType],
          validationOptions
        );

        if (error) {
          const validationErrors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            type: key,
          }));

          // Only log validation errors in development or for critical endpoints
          if (!isProduction || req.path.includes('/admin/') || req.path.includes('/auth/')) {
            logger.debug('Validation error:', {
              path: req.path,
              type: key,
              errors: validationErrors
            });
          }

          throw new ApiError(400, "Validation Error", validationErrors, 'validationError');
        }

        // Update request with validated and sanitized values
        req[key as ValidationType] = value;
      });

      return next();
    } catch (err) {
      next(err);
    }
  };
};

// Legacy support for old validateRequest function
export const validateRequest = (schema: Schema) => {
  return validate({
    body: schema,
  });
};