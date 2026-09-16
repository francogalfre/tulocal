"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";

import { findOwnedProduct } from "@/features/product/find";
import { PRODUCT_DETAILS_ERROR, readProductDetails } from "@/features/product/schema";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreTag } from "@/lib/tags";

export type UpdateProductState = {
  error: string | null;
};

export async function updateProduct(
  _previousState: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  const session = await requireCurrentSession();
  const details = readProductDetails(formData);

  if (details === null) {
    return { error: PRODUCT_DETAILS_ERROR };
  }

  const product = await findOwnedProduct(details.productId, session.user.id);

  if (product === null) {
    return { error: "No encontramos el producto." };
  }

  if (product.status === "sold") {
    return { error: "No podés editar un producto ya vendido." };
  }

  await database
    .update(products)
    .set({
      title: details.title,
      description: details.description,
      category: details.category,
      condition: details.condition,
      brand: details.brand,
      model: details.model,
      listPriceInArs: details.listPriceInArs,
      floorPriceInArs: details.floorPriceInArs,
    })
    .where(eq(products.id, product.id));
  logEvent({ event: "product.updated", productId: product.id, storeId: product.store.id });
  updateTag(buildStoreTag(product.store.handle));
  redirect(`/product/${product.id}`);
}
