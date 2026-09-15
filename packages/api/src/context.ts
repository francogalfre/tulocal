import type { createAuth } from "@tulocal/auth";
import type { Database } from "@tulocal/db";

export type ApiEnv = {
  TAVILY_API_KEY: string;
  APP_URL: string;
};

export type Context = {
  db: Database;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
  env: ApiEnv;
};
