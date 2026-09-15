import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { DatabaseConfig } from "./config";
import * as schema from "./schema";

export function createDb(env: DatabaseConfig) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;
