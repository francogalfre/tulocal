import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";

export type OwnedProduct = NonNullable<Awaited<ReturnType<typeof queryProduct>>>;

async function queryProduct(productId: string) {
  return database.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      store: true,
      images: { orderBy: [asc(images.sortOrder)] },
      comparables: true,
    },
  });
}

export async function findOwnedProduct(
  productId: string,
  ownerId: string,
): Promise<OwnedProduct | null> {
  const product = await queryProduct(productId);

  if (product === undefined || product.store.ownerId !== ownerId) {
    return null;
  }

  return product;
}
