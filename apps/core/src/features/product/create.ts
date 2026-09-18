"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";
import { after } from "next/server";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { uploadBlob } from "@tulocal/storage/blob";

import { releaseProductCreation, reserveProductCreation } from "@/features/plan/limits/reserve";
import { findProductCreationBlocker } from "@/features/plan/limits/usage";
import { runPipeline } from "@/features/product/pipeline/run";
import { describeInvalidPhotos } from "@/features/product/upload/limits";
import { ensureStore } from "@/features/store/ensure";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";
import type { ProductCreationBlocker } from "@/features/plan/limits/usage";

export type CreateProductState = {
  error: string | null;
  isPlanLimitReached: boolean;
};

const BLOCKED_CREATION_STATES: Record<ProductCreationBlocker, CreateProductState> = {
  "plan-limit": {
    error: "Llegaste al límite de productos de tu plan.",
    isPlanLimitReached: true,
  },
  "monthly-limit": {
    error: "Llegaste a los productos nuevos de este mes. El cupo se renueva el 1.",
    isPlanLimitReached: true,
  },
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
  const blocker = await findProductCreationBlocker(store.id);

  if (blocker !== null) {
    return BLOCKED_CREATION_STATES[blocker];
  }

  const photos = formData.getAll("photos").filter((entry) => entry instanceof File);
  const invalidPhotosMessage = describeInvalidPhotos(photos);

  if (invalidPhotosMessage !== null) {
    return { error: invalidPhotosMessage, isPlanLimitReached: false };
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
  const reservationId = await reserveProductCreation(store.id);

  if (reservationId === null) {
    return BLOCKED_CREATION_STATES["plan-limit"];
  }

  const [product] = await database.insert(products).values({ storeId: store.id }).returning();

  if (product === undefined) {
    await releaseProductCreation(reservationId);
    return { error: "No pudimos crear el producto. Probá de nuevo.", isPlanLimitReached: false };
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
