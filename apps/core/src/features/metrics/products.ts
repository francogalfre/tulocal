import { and, asc, count, eq, sql } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";
import { escalations } from "@tulocal/database/schema/escalations";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { visits } from "@tulocal/database/schema/visits";

import { selectCoverUrl } from "@/features/store/catalog";

const TOP_PRODUCTS_LIMIT = 5;

export type ProductPerformance = {
  id: string;
  title: string | null;
  status: typeof products.$inferSelect.status;
  coverUrl: string | null;
  views: number;
  whatsappClicks: number;
  chats: number;
  seriousBuyers: number;
};

async function queryCatalog(storeId: string) {
  return database
    .select({
      id: products.id,
      title: products.title,
      status: products.status,
      views: sql<number>`count(*) filter (where ${visits.kind} = 'product')`.mapWith(Number),
      whatsappClicks: sql<number>`count(*) filter (where ${visits.kind} = 'whatsapp')`.mapWith(
        Number,
      ),
    })
    .from(products)
    .leftJoin(visits, eq(visits.productId, products.id))
    .where(eq(products.storeId, storeId))
    .groupBy(products.id);
}

async function queryCovers(storeId: string) {
  return database
    .select({ productId: images.productId, url: images.url, kind: images.kind })
    .from(images)
    .innerJoin(products, eq(products.id, images.productId))
    .where(eq(products.storeId, storeId))
    .orderBy(asc(images.sortOrder));
}

async function queryChats(storeId: string) {
  return database
    .select({ productId: conversations.productId, total: count() })
    .from(conversations)
    .where(eq(conversations.storeId, storeId))
    .groupBy(conversations.productId);
}

async function querySeriousBuyers(storeId: string) {
  return database
    .select({ productId: escalations.productId, total: count() })
    .from(escalations)
    .where(and(eq(escalations.storeId, storeId), eq(escalations.kind, "buy_intent")))
    .groupBy(escalations.productId);
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

export async function findProductPerformance(storeId: string): Promise<ProductPerformance[]> {
  const [catalog, covers, chats, seriousBuyers] = await Promise.all([
    queryCatalog(storeId),
    queryCovers(storeId),
    queryChats(storeId),
    querySeriousBuyers(storeId),
  ]);

  const coversByProduct = groupCoversByProduct(covers);
  const chatsByProduct = new Map(chats.map((row) => [row.productId, row.total]));
  const seriousBuyersByProduct = new Map(seriousBuyers.map((row) => [row.productId, row.total]));

  return catalog.map((product) => ({
    ...product,
    coverUrl: selectCoverUrl(coversByProduct.get(product.id) ?? []),
    chats: chatsByProduct.get(product.id) ?? 0,
    seriousBuyers: seriousBuyersByProduct.get(product.id) ?? 0,
  }));
}

export function rankProductPerformance(performance: ProductPerformance[]): ProductPerformance[] {
  return [...performance]
    .sort((left, right) => right.views - left.views || right.chats - left.chats)
    .slice(0, TOP_PRODUCTS_LIMIT);
}
