import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';
import { ApiError } from '../utils/ApiResponse';
import { EnvVariables } from '../config/env';

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

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: EnvVariables.AWS_REGION,
    });
    this.userPoolId = EnvVariables.COGNITO_USER_POOL_ID;
    this.clientId = EnvVariables.COGNITO_CLIENT_ID;
  }

  /**
   * Register a new user (admin only)
   */
  async registerUser(data: RegisterRequest): Promise<CognitoUser> {
    try {
      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: data.email,
        UserAttributes: [
          { Name: 'email', Value: data.email },
          { Name: 'email_verified', Value: 'true' },
          ...(data.firstName ? [{ Name: 'given_name', Value: data.firstName }] : []),
          ...(data.lastName ? [{ Name: 'family_name', Value: data.lastName }] : []),
          ...(data.phone ? [{ Name: 'phone_number', Value: data.phone }] : []),
        ],
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
        phone: data.phone,
        emailVerified: true,
        status: 'CONFIRMED',
      };
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        throw new ApiError(409, 'User already exists', null, 'userExists');
      }
      throw new ApiError(500, 'Failed to create user', error, 'userCreationFailed');
    }
  }

  /**
   * Set user password (admin only)
   */
  private async setUserPassword(email: string, password: string): Promise<void> {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Password: password,
        Permanent: true,
      });

      await this.client.send(command);
    } catch (error) {
      throw new ApiError(500, 'Failed to set password', error, 'passwordSetFailed');
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
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
      const user = await this.getUserByEmail(email);

      return {
        user,
        tokens,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
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
}

export const cognitoService = new CognitoService();
