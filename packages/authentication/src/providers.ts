import { serverEnvironment } from "@tulocal/environment/server";

export const GOOGLE_PROVIDER_ID = "google";

export const socialProviders = {
  google: {
    clientId: serverEnvironment.GOOGLE_CLIENT_ID,
    clientSecret: serverEnvironment.GOOGLE_CLIENT_SECRET,
    prompt: "select_account",
  },
} as const;
