import { count, desc } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";
import { visits } from "@tulocal/database/schema/visits";

export type AdminStore = {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  suspendedAt: Date | null;
  productCount: number;
  visitCount: number;
};

async function queryStores() {
  return database
    .select({
      id: stores.id,
      name: stores.name,
      handle: stores.handle,
      description: stores.description,
      avatarUrl: stores.avatarUrl,
      createdAt: stores.createdAt,
      suspendedAt: stores.suspendedAt,
    })
    .from(stores)
    .orderBy(desc(stores.createdAt));
}

async function queryProductCounts() {
  return database
    .select({ storeId: products.storeId, total: count() })
    .from(products)
    .groupBy(products.storeId);
}

async function queryVisitCounts() {
  return database
    .select({ storeId: visits.storeId, total: count() })
    .from(visits)
    .groupBy(visits.storeId);
}

export async function findAdminStores(): Promise<AdminStore[]> {
  const [storeRows, productCountRows, visitCountRows] = await Promise.all([
    queryStores(),
    queryProductCounts(),
    queryVisitCounts(),
  ]);

  const productCountByStore = new Map(productCountRows.map((row) => [row.storeId, row.total]));
  const visitCountByStore = new Map(visitCountRows.map((row) => [row.storeId, row.total]));

  return storeRows.map((store) => ({
    ...store,
    productCount: productCountByStore.get(store.id) ?? 0,
    visitCount: visitCountByStore.get(store.id) ?? 0,
  }));
}
