import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const REDIS_URL_PROTOCOL = /^rediss?$/;

export const storageEnvironment = createEnv({
  server: {
    REDIS_URL: z.url({ protocol: REDIS_URL_PROTOCOL }),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENVIRONMENT_VALIDATION === "true",
});
