import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";

import { buildStoreTag } from "@/lib/tags";

const PUBLIC_PRODUCT_REVALIDATE_IN_SECONDS = 60 * 60;

const PUBLIC_IMAGE_COLUMNS = {
  id: true,
  url: true,
  kind: true,
  sortOrder: true,
} as const;

export type PublicProduct = NonNullable<Awaited<ReturnType<typeof queryPublicProduct>>>;

async function queryPublicProduct(productId: string) {
  const product = await database.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.status, "published")),
    columns: {
      id: true,
      title: true,
      description: true,
      category: true,
      condition: true,
      conditionNotes: true,
      listPriceInArs: true,
      attributes: true,
    },
    with: {
      images: { columns: PUBLIC_IMAGE_COLUMNS, orderBy: [asc(images.sortOrder)] },
      store: {
        columns: {
          id: true,
          ownerId: true,
          name: true,
          handle: true,
          whatsappPhone: true,
          agentName: true,
          agentSeed: true,
          agentVoice: true,
        },
      },
    },
  });

  return product ?? null;
}

function readCachedPublicProduct(handle: string, productId: string): Promise<PublicProduct | null> {
  return unstable_cache(() => queryPublicProduct(productId), [handle, productId], {
    tags: [buildStoreTag(handle)],
    revalidate: PUBLIC_PRODUCT_REVALIDATE_IN_SECONDS,
  })();
}

async function findPublicProductOnce(
  handle: string,
  productId: string,
): Promise<PublicProduct | null> {
  const product = await readCachedPublicProduct(handle, productId);

  if (product === null || product.store.handle !== handle) {
    return null;
  }

  return product;
}

export const findPublicProduct = cache(findPublicProductOnce);
