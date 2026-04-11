import connectToDatabase, {
  getDatabaseConnectionStateLabel,
  isDatabaseConnected,
} from "./config/database";
import logger from "./utils/logger";
import { EnvVariables, getMissingRequiredEnvKeys } from "./config/env";

let runtimeInitialized = false;
let runtimeInitError: Error | null = null;

const buildMissingEnvError = (missingKeys: string[]) =>
  new Error(
    `Missing required environment variables: ${missingKeys.join(", ")}`
  );

export const initRuntime = async () => {
  if (runtimeInitialized) {
    return;
  }

  if (runtimeInitError) {
    throw runtimeInitError;
  }

  const missingEnvKeys = getMissingRequiredEnvKeys();
  if (missingEnvKeys.length > 0) {
    runtimeInitError = buildMissingEnvError(missingEnvKeys);
    throw runtimeInitError;
  }

  runtimeInitialized = true;
};

export const ensureDatabaseConnection = async () => {
  await initRuntime();

  if (isDatabaseConnected()) {
    return;
  }

  try {
    await connectToDatabase();
  } catch (error) {
    logger.error(
      {
        err: error,
        connectionState: getDatabaseConnectionStateLabel(),
      },
      "Database initialization failed"
    );
    throw error;
  }
};

export const prepareRuntime = async () => {
  await initRuntime();
  await ensureDatabaseConnection();
};

export const getRuntimeErrorPayload = (error: unknown) => ({
  success: false,
  message: "Internal Server Error",
  data:
    EnvVariables.NODE_ENV === "development"
      ? error instanceof Error
        ? error.message
        : "Unknown error"
      : undefined,
});
