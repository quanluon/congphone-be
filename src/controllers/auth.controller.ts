import { Request, Response, NextFunction } from "express";
import { ApiResponse, ApiError } from "../utils/ApiResponse";
import { authService } from "../services/auth.service";
import { getCurrentUser } from "../middleware/auth";
import { UserType } from "../models/user.model";

export class AuthController {
  /**
   * Register a new user (public)
   */
  async registerPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      const user = await authService.registerUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        userType: UserType.CUSTOMER,
      });

      res.status(201).json(
        ApiResponse.success(user, 'User registered successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a new user (admin only)
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone, userType } = req.body;
      const currentUser = getCurrentUser(req);

      // Only admins can register new users
      if (currentUser?.type !== UserType.ADMIN) {
        throw new ApiError(403, 'Admin access required', null, 'adminAccessRequired');
      }

      const user = await authService.registerUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        userType: userType || UserType.CUSTOMER,
      }, currentUser._id?.toString());

      res.status(201).json(
        ApiResponse.success(user, 'User registered successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json(
        ApiResponse.success({
          user: result.user,
          tokens: result.tokens,
        }, 'Login successful').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshToken(refreshToken);

      res.json(
        ApiResponse.success(result, 'Token refreshed successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getCurrentUser(req);
      
      if (!user) {
        throw new ApiError(401, 'User not authenticated', null, 'authenticationFailed');
      }

      // Get access token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Access token required', null, 'accessTokenRequired');
      }

      const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      await authService.logout(accessToken);

      res.json(
        ApiResponse.success(null, 'Logout successful').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate forgot password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      await authService.forgotPassword(email);

      res.json(
        ApiResponse.success(null, 'Password reset email sent').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm forgot password
   */
  async confirmForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, confirmationCode, newPassword } = req.body;

      await authService.confirmForgotPassword(email, confirmationCode, newPassword);

      res.json(
        ApiResponse.success(null, 'Password reset successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getCurrentUser(req);

      if (!user) {
        throw new ApiError(401, 'User not authenticated', null, 'authenticationFailed');
      }

      res.json(
        ApiResponse.success(user, 'Profile retrieved successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getCurrentUser(req);
      const { firstName, lastName, phone, profileImage } = req.body;
      const updatedUser = await authService.updateUserProfile(user.cognitoId, {
        firstName,
        lastName,
        phone,
        profileImage,
      });

      res.json(
        ApiResponse.success(updatedUser, 'Profile updated successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, userType, status } = req.query;

      const result = await authService.getAllUsers(
        Number(page),
        Number(limit),
        userType as any,
        status as any
      );

      res.json(
        ApiResponse.success(result, 'Users retrieved successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = getCurrentUser(req);
      const { email } = req.params;
      await authService.deactivateUser(email, currentUser._id?.toString() || '');

      res.json(
        ApiResponse.success(null, 'User deactivated successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await authService.getUserByEmail(id);

      if (!user) {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }

      res.json(
        ApiResponse.success(user, 'User retrieved successfully').build()
      );
    } catch (error) {
      next(error);
    }
  }
}
