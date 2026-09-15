import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { databaseEnvironment } from "@tulocal/environment/database";

import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "@tulocal/database/schema/authentication";

const schema = { users, sessions, accounts, verifications, rateLimits };

export const database = drizzle(neon(databaseEnvironment.DATABASE_URL), { schema });

export type Database = typeof database;
