import { eq, isNull } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export type SitemapProduct = {
  id: string;
  updatedAt: Date;
};

export type SitemapStore = {
  handle: string;
  updatedAt: Date;
  products: SitemapProduct[];
};

export async function findPublicSitemapStores(): Promise<SitemapStore[]> {
  const rows = await database.query.stores.findMany({
    where: isNull(stores.suspendedAt),
    columns: { handle: true, updatedAt: true },
    with: {
      products: {
        where: eq(products.status, "published"),
        columns: { id: true, updatedAt: true },
      },
    },
  });

  return rows.filter((store) => store.products.length > 0);
}
