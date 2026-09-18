import { asc, count, desc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { users } from "@tulocal/database/schema/authentication";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";
import { visits } from "@tulocal/database/schema/visits";

import { selectCoverUrl } from "@/features/store/catalog";

export type AdminStoreProduct = {
  id: string;
  title: string | null;
  status: typeof products.$inferSelect.status;
  listPriceInArs: number | null;
  coverUrl: string | null;
};

export type AdminStoreDetail = {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  locationName: string | null;
  ownerEmail: string;
  createdAt: Date;
  suspendedAt: Date | null;
  visitCount: number;
  productCount: number;
  publishedCount: number;
  soldCount: number;
  products: AdminStoreProduct[];
};

async function queryStore(id: string) {
  const rows = await database
    .select({
      id: stores.id,
      name: stores.name,
      handle: stores.handle,
      description: stores.description,
      avatarUrl: stores.avatarUrl,
      bannerUrl: stores.bannerUrl,
      locationName: stores.locationName,
      createdAt: stores.createdAt,
      suspendedAt: stores.suspendedAt,
      ownerEmail: users.email,
    })
    .from(stores)
    .innerJoin(users, eq(users.id, stores.ownerId))
    .where(eq(stores.id, id));

  return rows[0];
}

async function queryProducts(storeId: string) {
  return database
    .select({
      id: products.id,
      title: products.title,
      status: products.status,
      listPriceInArs: products.listPriceInArs,
    })
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));
}

async function queryCovers(storeId: string) {
  return database
    .select({ productId: images.productId, url: images.url, kind: images.kind })
    .from(images)
    .innerJoin(products, eq(products.id, images.productId))
    .where(eq(products.storeId, storeId))
    .orderBy(asc(images.sortOrder));
}

async function countStoreVisits(storeId: string): Promise<number> {
  const rows = await database
    .select({ total: count() })
    .from(visits)
    .where(eq(visits.storeId, storeId));

  return rows[0]?.total ?? 0;
}

function groupCoversByProduct(
  covers: Awaited<ReturnType<typeof queryCovers>>,
): Map<string, { url: string; kind: string }[]> {
  const grouped = new Map<string, { url: string; kind: string }[]>();

  for (const cover of covers) {
    const existing = grouped.get(cover.productId);

    if (existing === undefined) {
      grouped.set(cover.productId, [cover]);
    } else {
      existing.push(cover);
    }
  }

  return grouped;
}

export async function findAdminStoreDetail(id: string): Promise<AdminStoreDetail | null> {
  const [store, storeProducts, covers, visitCount] = await Promise.all([
    queryStore(id),
    queryProducts(id),
    queryCovers(id),
    countStoreVisits(id),
  ]);

  if (store === undefined) {
    return null;
  }

  const coversByProduct = groupCoversByProduct(covers);
  const products = storeProducts.map((product) => ({
    ...product,
    coverUrl: selectCoverUrl(coversByProduct.get(product.id) ?? []),
  }));

  return {
    ...store,
    products,
    visitCount,
    productCount: products.length,
    publishedCount: products.filter((product) => product.status === "published").length,
    soldCount: products.filter((product) => product.status === "sold").length,
  };
}
