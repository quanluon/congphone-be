import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import { EnvVariables } from "../config/env";

const getIssuer = () =>
  `https://cognito-idp.${EnvVariables.AWS_REGION || "ap-southeast-1"}.amazonaws.com/${EnvVariables.COGNITO_USER_POOL_ID}`;

const getJwks = () =>
  createRemoteJWKSet(new URL(`${getIssuer()}/.well-known/jwks.json`));

export interface CognitoJWTPayload extends JWTPayload {
  sub: string;
  email?: string;
  'cognito:groups'?: string[];
  token_use: string;
  scope?: string;
  auth_time?: number;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

/**
 * Verify a Cognito JWT token using jose
 * @param token - The JWT token to verify
 * @returns The verified JWT payload
 * @throws Error if token is invalid
 */
export async function verifyCognitoToken(token: string): Promise<CognitoJWTPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: getIssuer(),
      // audience: EnvVariables.COGNITO_CLIENT_ID,
    });

    return payload as CognitoJWTPayload;
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      throw new Error('Token expired');
    }
    if (error.code === 'ERR_JWT_INVALID') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extract user ID from JWT token
 * @param token - The JWT token
 * @returns The user ID (sub claim)
 */
export async function getUserIdFromToken(token: string): Promise<string> {
  const payload = await verifyCognitoToken(token);
  return payload.sub;
}

/**
 * Check if user is in a specific Cognito group
 * @param token - The JWT token
 * @param groupName - The group name to check
 * @returns True if user is in the group
 */
export async function isUserInGroup(token: string, groupName: string): Promise<boolean> {
  try {
    const payload = await verifyCognitoToken(token);
    return payload['cognito:groups']?.includes(groupName) || false;
  } catch {
    return false;
  }
}
