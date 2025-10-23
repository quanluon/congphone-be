import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType,
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { EnvVariables } from '../config/env';
import { ApiError } from '../utils/ApiResponse';
import logger from '../utils/logger';

export interface CognitoTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface CognitoUser {
  cognitoId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified: boolean;
  status: string;
}

export interface LoginResponse {
  user: CognitoUser;
  tokens: CognitoTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType: 'customer' | 'admin';
}

export interface SocialLoginRequest {
  provider: 'facebook' | 'google';
  accessToken: string;
  idToken?: string;
}

export interface SocialUserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: 'facebook' | 'google';
}

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    // Validate required environment variables
    if (!EnvVariables.AWS_REGION) {
      throw new Error('AWS_REGION environment variable is required');
    }
    if (!EnvVariables.COGNITO_USER_POOL_ID) {
      throw new Error('COGNITO_USER_POOL_ID environment variable is required');
    }
    if (!EnvVariables.COGNITO_CLIENT_ID) {
      throw new Error('COGNITO_CLIENT_ID environment variable is required');
    }

    this.client = new CognitoIdentityProviderClient({
      region: EnvVariables.AWS_REGION,
    });
    this.userPoolId = EnvVariables.COGNITO_USER_POOL_ID;
    this.clientId = EnvVariables.COGNITO_CLIENT_ID;
  }

  /**
   * Register a new user
   */
  async registerUser(data: RegisterRequest): Promise<CognitoUser> {
    try {
      // Validate required environment variables
      if (!this.userPoolId || !this.clientId) {
        throw new ApiError(500, 'Cognito configuration missing', null, 'cognitoConfigMissing');
      }

      // Use phone number as provided without validation
      const formattedPhone = data.phone;

      // Build user attributes array
      const userAttributes: AttributeType[] = [
        { Name: 'email', Value: data.email },
        { Name: 'email_verified', Value: 'true' },
      ];

      // Add optional attributes only if they have values
      if (data.firstName && data.firstName.trim()) {
        userAttributes.push({ Name: 'given_name', Value: data.firstName.trim() });
      }
      if (data.lastName && data.lastName.trim()) {
        userAttributes.push({ Name: 'family_name', Value: data.lastName.trim() });
      }
      if (formattedPhone) {
        userAttributes.push({ Name: 'phone_number', Value: formattedPhone });
        userAttributes.push({ Name: 'phone_number_verified', Value: 'true' });
      }

      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: data.email,
        UserAttributes: userAttributes,
        TemporaryPassword: data.password,
        MessageAction: 'SUPPRESS', // Don't send welcome email
      });

      const response = await this.client.send(command);

      // Set permanent password
      await this.setUserPassword(data.email, data.password);

      return {
        cognitoId: response.User?.Username || '',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: formattedPhone,
        emailVerified: true,
        status: 'CONFIRMED',
      };
    } catch (error: any) {
      logger.error({ err: error, email: data.email }, 'Cognito registration error');
      
      if (error.name === 'UsernameExistsException') {
        throw new ApiError(409, 'User already exists', null, 'userExists');
      }
      if (error.name === 'InvalidParameterException') {
        throw new ApiError(400, 'Invalid user parameters', error, 'invalidParameters');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new ApiError(400, 'Password does not meet requirements', null, 'invalidPassword');
      }
      if (error.name === 'InvalidEmailAddressException') {
        throw new ApiError(400, 'Invalid email address', null, 'invalidEmail');
      }
      throw new ApiError(500, 'Failed to create user', error, 'userCreationFailed');
    }
  }

  /**
   * Set user password (admin only)
   */
  private async setUserPassword(email: string, password: string): Promise<void> {
    try {
      // Validate password requirements
      if (!password || password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long', null, 'invalidPassword');
      }

      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Password: password,
        Permanent: true,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'InvalidPasswordException') {
        throw new ApiError(400, 'Password does not meet requirements', null, 'invalidPassword');
      }
      throw new ApiError(500, 'Failed to set password', error, 'passwordSetFailed');
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Validate required parameters
      if (!email || !email.trim()) {
        throw new ApiError(400, 'Email is required', null, 'emailRequired');
      }
      if (!password || !password.trim()) {
        throw new ApiError(400, 'Password is required', null, 'passwordRequired');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, 'Invalid email format', null, 'invalidEmailFormat');
      }

      // Validate required environment variables
      if (!this.userPoolId || !this.clientId) {
        throw new ApiError(500, 'Cognito configuration missing', null, 'cognitoConfigMissing');
      }

      const command = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email.trim(),
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);

      if (response.ChallengeName) {
        throw new ApiError(400, 'Password change required', null, 'passwordChangeRequired');
      }

      if (!response.AuthenticationResult) {
        throw new ApiError(401, 'Authentication failed', null, 'authenticationFailed');
      }

      const tokens = {
        accessToken: response.AuthenticationResult.AccessToken || '',
        refreshToken: response.AuthenticationResult.RefreshToken || '',
        idToken: response.AuthenticationResult.IdToken || '',
        expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
      };

      // Get user details
      const user = await this.getUserByEmail(email.trim());

      return {
        user,
        tokens,
      };
    } catch (error: any) {
      logger.error({ err: error, email }, 'Cognito login error');
      
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'InvalidParameterException') {
        throw new ApiError(400, 'Invalid login parameters', error, 'invalidLoginParameters');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new ApiError(401, 'Invalid credentials', null, 'invalidCredentials');
      }
      if (error.name === 'UserNotConfirmedException') {
        throw new ApiError(400, 'User not confirmed', null, 'userNotConfirmed');
      }
      if (error.name === 'UserNotFoundException') {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }
      if (error.name === 'TooManyRequestsException') {
        throw new ApiError(429, 'Too many login attempts', null, 'tooManyRequests');
      }
      throw new ApiError(500, 'Login failed', error, 'loginFailed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<CognitoTokens> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await this.client.send(command);

      if (!response.AuthenticationResult) {
        throw new ApiError(401, 'Token refresh failed', null, 'tokenRefreshFailed');
      }

      return {
        accessToken: response.AuthenticationResult.AccessToken || '',
        refreshToken: response.AuthenticationResult.RefreshToken || refreshToken,
        idToken: response.AuthenticationResult.IdToken || '',
        expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, 'Invalid refresh token', null, 'invalidRefreshToken');
    }
  }

  /**
   * Logout user (global sign out)
   */
  async logout(accessToken: string): Promise<void> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, 'Invalid access token', null, 'invalidAccessToken');
    }
  }

  /**
   * Initiate forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }
      if (error.name === 'LimitExceededException') {
        throw new ApiError(429, 'Too many requests', null, 'tooManyRequests');
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
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error.name === 'CodeMismatchException') {
        throw new ApiError(400, 'Invalid confirmation code', null, 'invalidConfirmationCode');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new ApiError(400, 'Confirmation code expired', null, 'confirmationCodeExpired');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new ApiError(400, 'Invalid password format', null, 'invalidPasswordFormat');
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
      // Validate password requirements
      if (!newPassword || newPassword.length < 8) {
        throw new ApiError(400, 'New password must be at least 8 characters long', null, 'invalidPassword');
      }

      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: currentPassword,
        ProposedPassword: newPassword,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'NotAuthorizedException') {
        throw new ApiError(401, 'Current password is incorrect', null, 'incorrectCurrentPassword');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new ApiError(400, 'New password does not meet requirements', null, 'invalidNewPassword');
      }
      if (error.name === 'InvalidParameterException') {
        throw new ApiError(400, 'Invalid parameters provided', null, 'invalidParameters');
      }
      if (error.name === 'LimitExceededException') {
        throw new ApiError(429, 'Too many password change attempts', null, 'tooManyAttempts');
      }
      throw new ApiError(500, 'Failed to change password', error, 'passwordChangeFailed');
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<CognitoUser> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      const response = await this.client.send(command);

      const attributes = response.UserAttributes || [];
      const getAttribute = (name: string) => 
        attributes.find(attr => attr.Name === name)?.Value;

      return {
        cognitoId: response.Username || '',
        email: getAttribute('email') || email,
        firstName: getAttribute('given_name'),
        lastName: getAttribute('family_name'),
        phone: getAttribute('phone_number'),
        emailVerified: getAttribute('email_verified') === 'true',
        status: response.UserStatus || 'UNKNOWN',
      };
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }
      throw new ApiError(500, 'Failed to get user', error, 'getUserFailed');
    }
  }

  /**
   * Update user attributes
   */
  async updateUserAttributes(email: string, attributes: Record<string, string>): Promise<void> {
    try {
      const userAttributes: AttributeType[] = Object.entries(attributes).map(([name, value]) => ({
        Name: name,
        Value: value,
      }));

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: userAttributes,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }
      throw new ApiError(500, 'Failed to update user', error, 'updateUserFailed');
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(email: string): Promise<void> {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      await this.client.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new ApiError(404, 'User not found', null, 'userNotFound');
      }
      throw new ApiError(500, 'Failed to delete user', error, 'deleteUserFailed');
    }
  }

  /**
   * Get user info from social provider
   */
  private async getSocialUserInfo(provider: 'facebook' | 'google', accessToken: string): Promise<SocialUserInfo> {
    try {
      let userInfo: any;

      if (provider === 'facebook') {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Facebook user info');
        }
        userInfo = await response.json();
        
        return {
          id: userInfo.id,
          email: userInfo.email,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
          picture: userInfo.picture?.data?.url,
          provider: 'facebook'
        };
      } else if (provider === 'google') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Google user info');
        }
        userInfo = await response.json();
        
        return {
          id: userInfo.id,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          picture: userInfo.picture,
          provider: 'google'
        };
      }

      throw new Error('Unsupported social provider');
    } catch (error: any) {
      throw new ApiError(400, 'Failed to get social user info', error, 'socialUserInfoFailed');
    }
  }

  /**
   * Social login (Facebook/Google)
   */
  async socialLogin(data: SocialLoginRequest): Promise<LoginResponse> {
    try {
      // Get user info from social provider
      const socialUserInfo = await this.getSocialUserInfo(data.provider, data.accessToken);

      if (!socialUserInfo.email) {
        throw new ApiError(400, 'Email is required for social login', null, 'emailRequired');
      }

      // Check if user exists in Cognito
      let cognitoUser: CognitoUser;
      try {
        cognitoUser = await this.getUserByEmail(socialUserInfo.email);
      } catch (error: any) {
        // User doesn't exist, create new user
        if (error.code === 'userNotFound') {
          cognitoUser = await this.createSocialUser(socialUserInfo);
        } else {
          throw error;
        }
      }

      // For social login, we need to use the social provider's token
      // This would typically be handled by Cognito's hosted UI or custom flow
      // For now, we'll return the user info and let the frontend handle the token exchange
      
      return {
        user: cognitoUser,
        tokens: {
          accessToken: data.accessToken, // This should be exchanged for Cognito tokens
          refreshToken: '', // Will be provided by Cognito after proper token exchange
          idToken: data.idToken || '',
          expiresIn: 3600,
        },
      };
    } catch (error: any) {
      logger.error({ err: error, provider: data.provider }, 'Social login error');
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Social login failed', error, 'socialLoginFailed');
    }
  }

  /**
   * Create user from social login
   */
  private async createSocialUser(socialUserInfo: SocialUserInfo): Promise<CognitoUser> {
    try {
      // Generate a random password for social users
      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';

      const userAttributes: AttributeType[] = [
        { Name: 'email', Value: socialUserInfo.email },
        { Name: 'email_verified', Value: 'true' },
      ];

      if (socialUserInfo.firstName) {
        userAttributes.push({ Name: 'given_name', Value: socialUserInfo.firstName });
      }
      if (socialUserInfo.lastName) {
        userAttributes.push({ Name: 'family_name', Value: socialUserInfo.lastName });
      }
      if (socialUserInfo.picture) {
        userAttributes.push({ Name: 'picture', Value: socialUserInfo.picture });
      }

      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: socialUserInfo.email,
        UserAttributes: userAttributes,
        TemporaryPassword: randomPassword,
        MessageAction: 'SUPPRESS',
      });

      const response = await this.client.send(command);

      // Set permanent password
      await this.setUserPassword(socialUserInfo.email, randomPassword);

      return {
        cognitoId: response.User?.Username || '',
        email: socialUserInfo.email,
        firstName: socialUserInfo.firstName,
        lastName: socialUserInfo.lastName,
        emailVerified: true,
        status: 'CONFIRMED',
      };
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        // User already exists, get the existing user
        return await this.getUserByEmail(socialUserInfo.email);
      }
      throw new ApiError(500, 'Failed to create social user', error, 'socialUserCreationFailed');
    }
  }

  /**
   * Exchange social token for Cognito tokens
   */
  async exchangeSocialToken(provider: 'facebook' | 'google', socialToken: string): Promise<CognitoTokens> {
    try {
      // This is a simplified implementation
      // In a real scenario, you would use Cognito's hosted UI or implement the proper OAuth flow
      // For now, we'll return the social token as the access token
      
      return {
        accessToken: socialToken,
        refreshToken: '',
        idToken: '',
        expiresIn: 3600,
      };
    } catch (error: any) {
      throw new ApiError(500, 'Failed to exchange social token', error, 'tokenExchangeFailed');
    }
  }
}

export const cognitoService = new CognitoService();
