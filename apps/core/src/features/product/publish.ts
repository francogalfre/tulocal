"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

import { findOwnedProduct } from "@/features/product/find";
import { PRODUCT_DETAILS_ERROR, readProductDetails } from "@/features/product/schema";
import { logEvent } from "@/lib/logger";
import { argentinePhoneSchema } from "@/lib/phone/schema";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreTag } from "@/lib/tags";

export type PublishProductState = {
  error: string | null;
};

function readWhatsapp(formData: FormData): string | null {
  const entry = formData.get("whatsappPhone");

  if (entry === null || entry === "") {
    return null;
  }

  const parsed = argentinePhoneSchema.safeParse(entry);

  return parsed.success ? parsed.data : null;
}

export async function publishProduct(
  _previousState: PublishProductState,
  formData: FormData,
): Promise<PublishProductState> {
  const session = await requireCurrentSession();
  const details = readProductDetails(formData);

  if (details === null) {
    return { error: PRODUCT_DETAILS_ERROR };
  }

  const product = await findOwnedProduct(details.productId, session.user.id);

  if (product === null) {
    return { error: "No encontramos el producto." };
  }

  const whatsappPhone = readWhatsapp(formData) ?? product.store.whatsappPhone;

  if (whatsappPhone === null) {
    return { error: "Dejanos tu WhatsApp para avisarte cuando aparezca un comprador." };
  }

  await database.batch([
    database
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
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(products.id, product.id)),
    database.update(stores).set({ whatsappPhone }).where(eq(stores.id, product.store.id)),
  ]);
  logEvent({ event: "product.published", productId: product.id, storeId: product.store.id });
  updateTag(buildStoreTag(product.store.handle));
  redirect(`/product/${product.id}?celebrate=1`);
}
