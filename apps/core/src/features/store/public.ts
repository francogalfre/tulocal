import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export type PublicStore = NonNullable<Awaited<ReturnType<typeof queryPublicStore>>>;

async function queryPublicStore(handle: string) {
  return database.query.stores.findFirst({
    where: eq(stores.handle, handle),
    columns: { id: true, name: true, handle: true, agentName: true },
    with: {
      products: {
        where: eq(products.status, "published"),
        columns: { id: true, title: true, description: true, listPriceInArs: true },
        with: { images: { orderBy: [asc(images.sortOrder)] } },
      },
    },
  });
}

export async function findPublicStore(handle: string): Promise<PublicStore | null> {
  const store = await queryPublicStore(handle);

  return store ?? null;
}
