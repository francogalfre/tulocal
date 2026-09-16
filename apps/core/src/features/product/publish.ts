"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

import { findOwnedProduct } from "@/features/product/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

const TITLE_MAX_LENGTH = 80;

const DESCRIPTION_MAX_LENGTH = 4000;

const WHATSAPP_DIGITS_PATTERN = /^\+?\d{8,15}$/;

const publishInputSchema = z.object({
  productId: z.uuid(),
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(DESCRIPTION_MAX_LENGTH),
  listPriceInArs: z.coerce.number().int().positive(),
  floorPriceInArs: z.coerce.number().int().positive(),
  whatsappPhone: z
    .string()
    .trim()
    .transform((phone) => phone.replaceAll(/[\s-]/g, ""))
    .pipe(z.string().regex(WHATSAPP_DIGITS_PATTERN))
    .nullable(),
});

export type PublishProductState = {
  error: string | null;
};

function readOptionalText(formData: FormData, key: string): string | null {
  const entry = formData.get(key);

  if (entry === null || entry === "") {
    return null;
  }

  return String(entry);
}

export async function publishProduct(
  _previousState: PublishProductState,
  formData: FormData,
): Promise<PublishProductState> {
  const session = await requireCurrentSession();
  const parsed = publishInputSchema.safeParse({
    productId: formData.get("productId"),
    title: formData.get("title"),
    description: formData.get("description"),
    listPriceInArs: formData.get("listPriceInArs"),
    floorPriceInArs: formData.get("floorPriceInArs"),
    whatsappPhone: readOptionalText(formData, "whatsappPhone"),
  });

  if (!parsed.success) {
    return { error: "Revisá los datos: título, descripción, precio, mínimo y WhatsApp." };
  }

  const input = parsed.data;

  if (input.floorPriceInArs > input.listPriceInArs) {
    return { error: "El precio mínimo no puede ser mayor que el precio de venta." };
  }

  const product = await findOwnedProduct(input.productId, session.user.id);

  if (product === null) {
    return { error: "No encontramos el producto." };
  }

  const whatsappPhone = input.whatsappPhone ?? product.store.whatsappPhone;

  if (whatsappPhone === null) {
    return { error: "Dejanos tu WhatsApp para avisarte cuando aparezca un comprador." };
  }

  await database.batch([
    database
      .update(products)
      .set({
        title: input.title,
        description: input.description,
        listPriceInArs: input.listPriceInArs,
        floorPriceInArs: input.floorPriceInArs,
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(products.id, product.id)),
    database.update(stores).set({ whatsappPhone }).where(eq(stores.id, product.store.id)),
  ]);
  logEvent({ event: "product.published", productId: product.id, storeId: product.store.id });
  revalidatePath(`/product/${product.id}`);

  return { error: null };
}
