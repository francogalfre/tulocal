import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { database } from "@tulocal/database/client";
import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "@tulocal/database/schema/authentication";
import { serverEnvironment } from "@tulocal/environment/server";

import { rateLimitRules } from "@tulocal/authentication/limits";
import { GOOGLE_PROVIDER_ID, socialProviders } from "@tulocal/authentication/providers";

const SECONDS_IN_ONE_MINUTE = 60;
const SECONDS_IN_ONE_HOUR = 60 * SECONDS_IN_ONE_MINUTE;
const SECONDS_IN_ONE_DAY = 24 * SECONDS_IN_ONE_HOUR;
const SESSION_LIFETIME_IN_SECONDS = 7 * SECONDS_IN_ONE_DAY;
const SESSION_REFRESH_AGE_IN_SECONDS = SECONDS_IN_ONE_DAY;
const SESSION_FRESHNESS_WINDOW_IN_SECONDS = SECONDS_IN_ONE_HOUR;
const SESSION_COOKIE_CACHE_IN_SECONDS = 5 * SECONDS_IN_ONE_MINUTE;

export const authentication = betterAuth({
  appName: "tulocal",
  baseURL: serverEnvironment.BETTER_AUTH_URL,
  secret: serverEnvironment.BETTER_AUTH_SECRET,
  trustedOrigins: [serverEnvironment.CORS_ORIGIN],
  database: drizzleAdapter(database, {
    provider: "pg",
    usePlural: true,
    schema: { users, sessions, accounts, verifications, rateLimits },
  }),
  socialProviders,
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [GOOGLE_PROVIDER_ID],
    },
  },
  session: {
    expiresIn: SESSION_LIFETIME_IN_SECONDS,
    updateAge: SESSION_REFRESH_AGE_IN_SECONDS,
    freshAge: SESSION_FRESHNESS_WINDOW_IN_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_COOKIE_CACHE_IN_SECONDS,
      strategy: "jwe",
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: rateLimitRules,
  },
  advanced: {
    cookiePrefix: "tulocal",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
});

export type Authentication = typeof authentication;
export type Session = typeof authentication.$Infer.Session;
export type AuthenticatedUser = typeof authentication.$Infer.Session.user;
