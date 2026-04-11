import dotenv from "dotenv";

dotenv.config();

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

export const REQUIRED_ENV_KEYS = [
  "MONGODB_URI",
  "MONGODB_NAME",
  "AWS_REGION",
  "COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID",
  "S3_BUCKET",
  "CLOUDFRONT_STORAGE_ENDPOINT",
  "DASHBOARD_URL",
  "ALLOWED_ORIGINS",
] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

const normalizeOriginList = (value?: string) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const isProduction = process.env.NODE_ENV === "production";
const configuredAllowedOrigins = normalizeOriginList(process.env.ALLOWED_ORIGINS);
const allowedOrigins =
  configuredAllowedOrigins.length > 0
    ? configuredAllowedOrigins
    : isProduction
      ? []
      : DEFAULT_ALLOWED_ORIGINS;

export const EnvVariables = {
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  ALLOWED_ORIGINS: allowedOrigins,
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_NAME: process.env.MONGODB_NAME,

  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  S3_BUCKET: process.env.S3_BUCKET,
  CLOUDFRONT_STORAGE_ENDPOINT: process.env.CLOUDFRONT_STORAGE_ENDPOINT,
  DASHBOARD_URL: process.env.DASHBOARD_URL,

  // Telegram Configuration
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  TELEGRAM_MENTION_USER_IDS:
    process.env.TELEGRAM_MENTION_USER_IDS || "1659457166",
} as const;

export const getMissingRequiredEnvKeys = (): RequiredEnvKey[] =>
  REQUIRED_ENV_KEYS.filter((key) => {
    if (key === "ALLOWED_ORIGINS") {
      return EnvVariables.ALLOWED_ORIGINS.length === 0;
    }

    const value = process.env[key];
    return !value || !value.trim();
  });
