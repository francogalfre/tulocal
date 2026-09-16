"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";
import { after } from "next/server";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { uploadBlob } from "@tulocal/storage/blob";

import { runPipeline } from "@/features/product/pipeline/run";
import { ensureStore } from "@/features/store/ensure";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

const MAX_PHOTOS = 3;

const MAX_PHOTO_SIZE_IN_BYTES = 15 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export type CreateProductState = {
  error: string | null;
};

function describeInvalidPhotos(photos: File[]): string | null {
  if (photos.length === 0) {
    return "Elegí al menos una foto.";
  }

  if (photos.length > MAX_PHOTOS) {
    return `Podés subir hasta ${MAX_PHOTOS} fotos.`;
  }

  if (photos.some((photo) => !ALLOWED_PHOTO_TYPES.has(photo.type))) {
    return "Solo aceptamos fotos en JPG, PNG, WEBP o HEIC.";
  }

  if (photos.some((photo) => photo.size > MAX_PHOTO_SIZE_IN_BYTES)) {
    return "Cada foto tiene que pesar menos de 15 MB.";
  }

  return null;
}

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
