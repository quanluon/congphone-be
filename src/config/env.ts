import dotenv from "dotenv";
dotenv.config();

export const EnvVariables = {
  NODE_ENV: process.env.NODE_ENV! || "development",
  LOG_LEVEL: process.env.LOG_LEVEL! || "info",
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_NAME: process.env.MONGODB_NAME!,

  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION!,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID!,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID!,
  S3_BUCKET: process.env.S3_BUCKET!,
  CLOUDFRONT_STORAGE_ENDPOINT: process.env.CLOUDFRONT_STORAGE_ENDPOINT!,
};
