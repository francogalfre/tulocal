import { eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { stores } from "@tulocal/database/schema/stores";

export type Store = typeof stores.$inferSelect;

export async function findStoreByOwner(ownerId: string): Promise<Store | null> {
  const store = await database.query.stores.findFirst({ where: eq(stores.ownerId, ownerId) });

  return store ?? null;
}
