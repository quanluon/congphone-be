import { User, IUser, UserType, UserStatus } from '../models/user.model';
import { cognitoService, CognitoUser, LoginResponse, RegisterRequest } from './cognito.service';
import { ApiError } from '../utils/ApiResponse';

export interface AuthUser extends IUser {
  fullName: string;
}

export class AuthService {
  /**
   * Register a new user (admin only)
   */
  async registerUser(data: RegisterRequest, createdBy?: string): Promise<AuthUser> {
    try {
      // Create user in Cognito
      const cognitoUser = await cognitoService.registerUser(data);

      // Create user in database
      const userData: Partial<IUser> = {
        cognitoId: cognitoUser.cognitoId,
        email: cognitoUser.email,
        firstName: cognitoUser.firstName,
        lastName: cognitoUser.lastName,
        phone: cognitoUser.phone,
        type: data.userType === 'admin' ? UserType.ADMIN : UserType.CUSTOMER,
        status: UserStatus.ACTIVE,
      };

      const user = new User(userData);
      const savedUser = await user.save();

      return this.formatUser(savedUser);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to register user', error, 'userRegistrationFailed');
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: AuthUser; tokens: any }> {
    try {
      // Authenticate with Cognito
      const cognitoResponse = await cognitoService.login(email, password);

      // Get user from database
      const user = await User.findOne({ 
        cognitoId: cognitoResponse.user.cognitoId,
        status: { $ne: UserStatus.INACTIVE }
      });

      if (!user) {
        throw new ApiError(404, 'User not found in database', null, 'userNotFound');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      return {
        user: this.formatUser(user),
        tokens: cognitoResponse.tokens,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Login failed', error, 'loginFailed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ tokens: any }> {
    try {
      const tokens = await cognitoService.refreshToken(refreshToken);
      return { tokens };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Token refresh failed', error, 'tokenRefreshFailed');
    }
  }

  /**
   * Initiate forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      // Check if user exists in database
      const user = await User.findOne({ email, status: { $ne: UserStatus.INACTIVE } });
      if (!user) {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }

      await cognitoService.forgotPassword(email);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to initiate password reset', error, 'passwordResetFailed');
    }
  }

  /**
   * Confirm forgot password
   */
  async confirmForgotPassword(
    email: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<void> {
    try {
      await cognitoService.confirmForgotPassword(email, confirmationCode, newPassword);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to reset password', error, 'passwordResetFailed');
    }
  }

  /**
   * Get user by Cognito ID
   */
  async getUserByCognitoId(cognitoId: string): Promise<AuthUser | null> {
    try {
      const user = await User.findOne({ 
        cognitoId,
        status: { $ne: UserStatus.INACTIVE }
      });

      if (!user) {
        return null;
      }

      return this.formatUser(user);
    } catch (error) {
      throw new ApiError(500, 'Failed to get user', error, 'getUserFailed');
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        status: { $ne: UserStatus.INACTIVE }
      });

      if (!user) {
        return null;
      }

      return this.formatUser(user);
    } catch (error) {
      throw new ApiError(500, 'Failed to get user', error, 'getUserFailed');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    cognitoId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      profileImage?: string;
    }
  ): Promise<AuthUser> {
    try {
      const user = await User.findOne({ cognitoId });
      if (!user) {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }

      // Update in database
      Object.assign(user, updates);
      await user.save();

      // Update in Cognito if needed
      const cognitoUpdates: Record<string, string> = {};
      if (updates.firstName) cognitoUpdates.given_name = updates.firstName;
      if (updates.lastName) cognitoUpdates.family_name = updates.lastName;
      if (updates.phone) cognitoUpdates.phone_number = updates.phone;

      if (Object.keys(cognitoUpdates).length > 0) {
        await cognitoService.updateUserAttributes(user.email, cognitoUpdates);
      }

      return this.formatUser(user);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update profile', error, 'updateProfileFailed');
    }
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(email: string, deactivatedBy: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }

      user.status = UserStatus.INACTIVE;
      await user.save();

      // Note: We don't delete from Cognito, just deactivate in our database
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to deactivate user', error, 'deactivateUserFailed');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    userType?: UserType,
    status?: UserStatus
  ): Promise<{ users: AuthUser[]; total: number; pages: number }> {
    try {
      const filter: any = {};
      if (userType) filter.type = userType;
      if (status) filter.status = status;

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      return {
        users: users.map(user => this.formatUser(user)),
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to get users', error, 'getUsersFailed');
    }
  }

  /**
   * Format user for response
   */
  private formatUser(user: IUser): AuthUser {
    return {
      ...user,
      fullName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || '',
    };
  }
}

export const authService = new AuthService();
