import { NextFunction, Request, Response } from "express";
import { verifyCognitoToken } from "../utils/jwt";
import { authService } from "../services/auth.service";
import { ApiError } from "../utils/ApiResponse";
import { IUser, UserType } from "../models/user.model";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

/**
 * Optional authentication middleware
 * If token is provided, verifies it and adds user to request
 * If no token or invalid token, continues without user
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    try {
      // Verify JWT token
      const payload = await verifyCognitoToken(token);

      // Get user from database
      const user = await authService.getUserByCognitoId(payload.sub);

      if (user) {
        req.user = user;
        req.token = token;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      // This is optional auth, so we don't throw an error
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Required authentication middleware
 * Requires valid token and user, throws error if not authenticated
 */
export const requiredAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    try {
      if (!req.user) {
        throw new ApiError(401, "User not found", null, "userNotFound");
      }

      next();
    } catch (error: any) {
      if (error.message === "Token expired") {
        throw new ApiError(401, "Token expired", null, "tokenExpired");
      }
      if (error.message === "Invalid token") {
        throw new ApiError(401, "Invalid token", null, "invalidToken");
      }
      throw new ApiError(
        401,
        error.message || "Authentication failed",
        null,
        error.msgCode || "authenticationFailed"
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Admin only middleware
 * Requires authentication and admin role
 */
export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.type !== UserType.ADMIN) {
      throw new ApiError(
        403,
        "Admin access required",
        null,
        "adminAccessRequired"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Customer only middleware
 * Requires authentication and customer role
 */
export const customerOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.type !== UserType.CUSTOMER) {
      throw new ApiError(
        403,
        "Customer access required",
        null,
        "customerAccessRequired"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user from request
 * Helper function to get the authenticated user
 */
export const getCurrentUser = (req: Request) => {
  return req.user;
};

/**
 * Check if user is authenticated
 * Helper function to check if user is logged in
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!req.user;
};

/**
 * Check if user is admin
 * Helper function to check if user is admin
 */
export const isAdmin = (req: Request): boolean => {
  return req.user?.type === UserType.ADMIN;
};

/**
 * Check if user is customer
 * Helper function to check if user is customer
 */
export const isCustomer = (req: Request): boolean => {
  return req.user?.type === UserType.CUSTOMER;
};
