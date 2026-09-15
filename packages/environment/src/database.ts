import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const POSTGRES_URL_PROTOCOL = /^postgres(ql)?$/;

export const databaseEnvironment = createEnv({
  server: {
    DATABASE_URL: z.url({ protocol: POSTGRES_URL_PROTOCOL }),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENVIRONMENT_VALIDATION === "true",
});
