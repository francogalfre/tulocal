"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";

import { findOwnedProduct } from "@/features/product/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

export async function markProductSold(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const product = await findOwnedProduct(String(formData.get("productId")), session.user.id);

  if (product === null) {
    return;
  }

  await database
    .update(products)
    .set({ status: "sold", soldAt: new Date() })
    .where(eq(products.id, product.id));
  logEvent({ event: "product.sold", productId: product.id, storeId: product.store.id });
  revalidatePath(`/product/${product.id}`);
  revalidatePath(`/${product.store.handle}`);
}
