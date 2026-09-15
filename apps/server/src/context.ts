import type { Context as ApiContext } from "@tulocal/api/context";
import type { Context as HonoContext } from "hono";

import { env } from "./env";
import { auth, getDb } from "./services";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions): Promise<ApiContext> {
  const db = getDb();
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return { db, session, env: { TAVILY_API_KEY: env.TAVILY_API_KEY, APP_URL: env.APP_URL } };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
