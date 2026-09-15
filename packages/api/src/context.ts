import type { createAuth } from "@tulocal/auth";
import type { Database } from "@tulocal/db";

export type Context = {
  auth: null;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
  db: Database;
};
