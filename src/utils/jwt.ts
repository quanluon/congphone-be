import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import { EnvVariables } from "../config/env";

const getIssuer = () =>
  `https://cognito-idp.${EnvVariables.AWS_REGION || "ap-southeast-1"}.amazonaws.com/${EnvVariables.COGNITO_USER_POOL_ID}`;

const getJwks = () =>
  createRemoteJWKSet(new URL(`${getIssuer()}/.well-known/jwks.json`));

const getFirebaseProjectId = () => EnvVariables.FIREBASE_PROJECT_ID;

const getFirebaseIssuer = () =>
  `https://securetoken.google.com/${getFirebaseProjectId()}`;

const getFirebaseJwks = () =>
  createRemoteJWKSet(
    new URL(
      "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
    )
  );

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

export interface FirebaseJWTPayload extends JWTPayload {
  user_id: string;
  email?: string;
  name?: string;
  picture?: string;
  phone_number?: string;
  firebase?: {
    sign_in_provider?: string;
  };
  iss: string;
  aud: string;
  sub: string;
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

export async function verifyFirebaseToken(
  token: string
): Promise<FirebaseJWTPayload> {
  try {
    const projectId = getFirebaseProjectId();

    if (!projectId) {
      throw new Error("Firebase project ID is not configured");
    }

    const { payload } = await jwtVerify(token, getFirebaseJwks(), {
      issuer: getFirebaseIssuer(),
      audience: projectId,
    });

    return payload as FirebaseJWTPayload;
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      throw new Error("Token expired");
    }
    if (
      error.code === "ERR_JWT_INVALID" ||
      error.code === "ERR_JWS_INVALID" ||
      error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED"
    ) {
      throw new Error("Invalid token");
    }
    throw new Error(error.message || "Token verification failed");
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
