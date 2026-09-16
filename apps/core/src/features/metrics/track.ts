"use server";

import { eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";

import { recordWhatsappClick } from "@/features/metrics/record";

export async function trackWhatsappClick(productId: string): Promise<void> {
  const product = await database.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true, storeId: true },
  });

  if (product === undefined) {
    return;
  }

  await recordWhatsappClick(product.storeId, product.id);
}
