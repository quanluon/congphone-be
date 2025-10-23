import { User, IUser, UserType, UserStatus } from '../../layers/common/nodejs/models/user.model';
import { cognitoService, CognitoUser, LoginResponse, RegisterRequest, SocialLoginRequest } from './cognito.service';
import { ApiError } from '../utils/ApiResponse';
import { Document } from 'mongoose';

export interface AuthUser extends IUser {
  fullName: string;
}

export class AuthService {
  /**
   * Register a new user
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
        type: data.userType === UserType.ADMIN ? UserType.ADMIN : UserType.CUSTOMER,
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
   * Logout user
   */
  async logout(accessToken: string): Promise<void> {
    try {
      await cognitoService.logout(accessToken);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Logout failed', error, 'logoutFailed');
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
   * Change password for authenticated user
   */
  async changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await cognitoService.changePassword(accessToken, currentPassword, newPassword);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to change password', error, 'passwordChangeFailed');
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
   * Social login (Facebook/Google)
   */
  async socialLogin(data: SocialLoginRequest): Promise<{ user: AuthUser; tokens: any }> {
    try {
      // Authenticate with social provider via Cognito
      const cognitoResponse = await cognitoService.socialLogin(data);

      // Get or create user in database
      let user = await User.findOne({ email: cognitoResponse.user.email });
      
      if (!user) {
        // Create new user in database
        const userData: Partial<IUser> = {
          cognitoId: cognitoResponse.user.cognitoId,
          email: cognitoResponse.user.email,
          firstName: cognitoResponse.user.firstName,
          lastName: cognitoResponse.user.lastName,
          phone: cognitoResponse.user.phone,
          type: UserType.CUSTOMER, // Social users are always customers
          status: UserStatus.ACTIVE,
        };

        user = new User(userData);
        await user.save();
      } else {
        // Update existing user with Cognito ID if not set
        if (!user.cognitoId) {
          user.cognitoId = cognitoResponse.user.cognitoId;
          await user.save();
        }
      }

      return {
        user: this.formatUser(user),
        tokens: cognitoResponse.tokens,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Social login failed', error, 'socialLoginFailed');
    }
  }

  /**
   * Format user for response
   */
  private formatUser(user: Document): AuthUser {
    const userJson = user.toJSON();
    return {
      ...userJson,
      fullName: userJson.firstName && userJson.lastName 
        ? `${userJson.firstName} ${userJson.lastName}` 
        : userJson.firstName || userJson.lastName || '',
    } as AuthUser;
  }
}

export const authService = new AuthService();
