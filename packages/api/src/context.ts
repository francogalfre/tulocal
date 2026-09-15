import type { createAuth } from "@tulocal/auth";
import type { Database } from "@tulocal/db";

export type Context = {
  db: Database;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
};
