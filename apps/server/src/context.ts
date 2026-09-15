import type { Context as ApiContext } from "@tulocal/api/context";
import type { Context as HonoContext } from "hono";

import { auth, getDb } from "./services";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions): Promise<ApiContext> {
  const db = getDb();
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return { db, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
