import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export type Store = typeof stores.$inferSelect;

export type StoreEntry = {
  handle: string;
  hasProducts: boolean;
};

export type OwnerCatalog = NonNullable<Awaited<ReturnType<typeof queryOwnerCatalog>>>;

async function queryOwnerCatalog(ownerId: string) {
  return database.query.stores.findFirst({
    where: eq(stores.ownerId, ownerId),
    with: {
      products: {
        orderBy: [asc(products.createdAt)],
        with: { images: { orderBy: [asc(images.sortOrder)] } },
      },
    },
  });
}

export async function findStoreByOwner(ownerId: string): Promise<Store | null> {
  const store = await database.query.stores.findFirst({ where: eq(stores.ownerId, ownerId) });

  return store ?? null;
}

export async function findOwnerCatalog(ownerId: string): Promise<OwnerCatalog | null> {
  const catalog = await queryOwnerCatalog(ownerId);

  return catalog ?? null;
}

export async function findStoreEntry(ownerId: string): Promise<StoreEntry | null> {
  const store = await database.query.stores.findFirst({
    where: eq(stores.ownerId, ownerId),
    columns: { handle: true },
    with: { products: { columns: { id: true }, limit: 1 } },
  });

  if (store === undefined) {
    return null;
  }

  return { handle: store.handle, hasProducts: store.products.length > 0 };
}
