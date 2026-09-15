import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { databaseEnvironment } from "@tulocal/environment/database";

const MINIMUM_AUTH_SECRET_LENGTH = 32;

export const serverEnvironment = createEnv({
  extends: [databaseEnvironment],
  server: {
    BETTER_AUTH_SECRET: z.string().min(MINIMUM_AUTH_SECRET_LENGTH),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    OPENROUTER_API_KEY: z.string().min(1),
    TAVILY_API_KEY: z.string().min(1),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENVIRONMENT_VALIDATION === "true",
});
