"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";

import { findOwnedProduct } from "@/features/product/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

export async function removeProduct(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const product = await findOwnedProduct(String(formData.get("productId")), session.user.id);

  if (product === null) {
    return;
  }

  await database.delete(products).where(eq(products.id, product.id));
  logEvent({ event: "product.removed", productId: product.id, storeId: product.store.id });
  revalidatePath(`/${product.store.handle}`);
  redirect(`/${product.store.handle}`);
}
