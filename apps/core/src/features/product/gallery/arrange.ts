"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";

import { findOwnedProduct } from "@/features/product/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreTag } from "@/lib/tags";

const arrangeImagesSchema = z.object({
  productId: z.uuid(),
  imageIds: z.array(z.uuid()).min(1),
});

export type ArrangeImagesInput = z.infer<typeof arrangeImagesSchema>;

export async function arrangeImages(input: ArrangeImagesInput): Promise<void> {
  const session = await requireCurrentSession();
  const { productId, imageIds } = arrangeImagesSchema.parse(input);
  const product = await findOwnedProduct(productId, session.user.id);

  if (product === null) {
    throw new Error("No encontramos el producto.");
  }

  const ownedImageIds = new Set(product.images.map((image) => image.id));
  const orderedIds = imageIds.filter((imageId) => ownedImageIds.has(imageId));
  const [firstId, ...restIds] = orderedIds;

  if (firstId === undefined) {
    return;
  }

  await database.batch([
    database
      .update(images)
      .set({ sortOrder: 0 })
      .where(and(eq(images.productId, productId), eq(images.id, firstId))),
    ...restIds.map((imageId, index) =>
      database
        .update(images)
        .set({ sortOrder: index + 1 })
        .where(and(eq(images.productId, productId), eq(images.id, imageId))),
    ),
  ]);
  logEvent({ event: "product.images.arranged", productId, storeId: product.store.id });
  updateTag(buildStoreTag(product.store.handle));
  revalidatePath(`/product/${productId}`);
}
