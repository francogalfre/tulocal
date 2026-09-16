import { and, asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";

export type PublicProduct = NonNullable<Awaited<ReturnType<typeof queryPublicProduct>>>;

async function queryPublicProduct(productId: string) {
  return database.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.status, "published")),
    columns: {
      id: true,
      title: true,
      description: true,
      condition: true,
      conditionNotes: true,
      listPriceInArs: true,
      attributes: true,
    },
    with: {
      images: { orderBy: [asc(images.sortOrder)] },
      store: {
        columns: { id: true, name: true, handle: true, whatsappPhone: true, agentName: true },
      },
    },
  });
}

export async function findPublicProduct(
  handle: string,
  productId: string,
): Promise<PublicProduct | null> {
  const product = await queryPublicProduct(productId);

  if (product === undefined || product.store.handle !== handle) {
    return null;
  }

  return product;
}
