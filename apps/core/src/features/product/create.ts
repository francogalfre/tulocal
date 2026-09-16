"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";
import { after } from "next/server";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { uploadBlob } from "@tulocal/storage/blob";

import { runPipeline } from "@/features/product/pipeline/run";
import { describeInvalidPhotos } from "@/features/product/upload/limits";
import { ensureStore } from "@/features/store/ensure";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

export type CreateProductState = {
  error: string | null;
};

function buildPhotoExtension(mediaType: string): string {
  return mediaType === "image/jpeg" ? "jpg" : (mediaType.split("/")[1] ?? "jpg");
}

export async function createProduct(
  _previousState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);
  const photos = formData.getAll("photos").filter((entry) => entry instanceof File);
  const invalidPhotosMessage = describeInvalidPhotos(photos);

  if (invalidPhotosMessage !== null) {
    return { error: invalidPhotosMessage };
  }

  const uploaded = await Promise.all(
    photos.map((photo) =>
      uploadBlob({
        pathname: `originals/${store.id}/${randomUUID()}.${buildPhotoExtension(photo.type)}`,
        body: photo,
        contentType: photo.type,
      }),
    ),
  );
  const [product] = await database.insert(products).values({ storeId: store.id }).returning();

  if (product === undefined) {
    return { error: "No pudimos crear el producto. Probá de nuevo." };
  }

  await database.insert(images).values(
    uploaded.map((stored, sortOrder) => ({
      productId: product.id,
      url: stored.url,
      kind: "original" as const,
      sortOrder,
    })),
  );
  logEvent({ event: "product.created", productId: product.id, storeId: store.id });
  after(() => runPipeline(product.id));
  redirect(`/product/${product.id}`);
}
