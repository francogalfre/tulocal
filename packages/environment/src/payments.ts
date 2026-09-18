import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const paymentsEnvironment = createEnv({
  server: {
    MERCADOPAGO_ACCESS_TOKEN: z.string().min(1).optional(),
    MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENVIRONMENT_VALIDATION === "true",
});
