import { and, asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { scenes } from "@tulocal/database/schema/scenes";
import { removeBlob, uploadBlob } from "@tulocal/storage/blob";

import { generateScene } from "@/features/product/export/scene";
import { downloadPhoto } from "@/features/product/pipeline/photos";
import { logEvent } from "@/lib/logger";
import type { SceneFormat } from "@/features/product/export/formats";
import type { Photo } from "@/features/product/pipeline/photos";

export type SceneRunInput = {
  productId: string;
  format: SceneFormat;
};

const ORIGINAL_IMAGE_KIND = "original";

const CONDITION_NOTES_SEPARATOR = ". ";

const MISSING_IMAGE_MESSAGE = "El modelo no devolvió una imagen";

const GENERIC_FAILURE_MESSAGE = "No pudimos generar la escena";

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return GENERIC_FAILURE_MESSAGE;
}

function buildImageExtension(mediaType: string): string {
  return mediaType === "image/jpeg" ? "jpg" : (mediaType.split("/")[1] ?? "png");
}

function splitConditionNotes(conditionNotes: string | null): string[] {
  if (conditionNotes === null) {
    return [];
  }

  return conditionNotes
    .split(CONDITION_NOTES_SEPARATOR)
    .map((note) => note.trim())
    .filter((note) => note !== "");
}

function whereScene(input: SceneRunInput) {
  return and(eq(scenes.productId, input.productId), eq(scenes.format, input.format));
}

async function loadSourcePhoto(productId: string): Promise<Photo> {
  const original = await database.query.images.findFirst({
    where: and(eq(images.productId, productId), eq(images.kind, ORIGINAL_IMAGE_KIND)),
    orderBy: [asc(images.sortOrder)],
  });

  if (original === undefined) {
    throw new Error("El producto no tiene fotos");
  }

  return downloadPhoto(original.url);
}

async function loadPreviousUrl(input: SceneRunInput): Promise<string | null> {
  const existing = await database.query.scenes.findFirst({ where: whereScene(input) });

  return existing === undefined ? null : existing.url;
}

async function storeScene(input: SceneRunInput, scene: Photo, previousUrl: string | null) {
  const stored = await uploadBlob({
    pathname: `products/${input.productId}/scenes/${input.format}.${buildImageExtension(scene.mediaType)}`,
    body: new Blob([scene.bytes.slice()], { type: scene.mediaType }),
    contentType: scene.mediaType,
  });

  if (previousUrl !== null) {
    await removeBlob(previousUrl);
  }

  await database
    .update(scenes)
    .set({ status: "ready", url: stored.url, error: null })
    .where(whereScene(input));
}

async function produceScene(input: SceneRunInput): Promise<void> {
  const [product, source, previousUrl] = await Promise.all([
    database.query.products.findFirst({ where: eq(products.id, input.productId) }),
    loadSourcePhoto(input.productId),
    loadPreviousUrl(input),
  ]);

  if (product === undefined) {
    throw new Error("El producto no existe");
  }

  const scene = await generateScene({
    source,
    prompt: {
      format: input.format,
      category: product.category,
      brand: product.brand,
      model: product.model,
      attributes: product.attributes,
      conditionNotes: splitConditionNotes(product.conditionNotes),
    },
  });

  if (scene === null) {
    throw new Error(MISSING_IMAGE_MESSAGE);
  }

  logEvent({
    event: "export.scene.generated",
    productId: input.productId,
    detail: `${input.format} ${scene.mediaType} ${scene.bytes.byteLength} bytes`,
  });
  await storeScene(input, scene, previousUrl);
}

export async function runSceneGeneration(input: SceneRunInput): Promise<void> {
  logEvent({ event: "export.scene.started", productId: input.productId, detail: input.format });

  try {
    await produceScene(input);
    logEvent({ event: "export.scene.completed", productId: input.productId, detail: input.format });
  } catch (error) {
    const detail = describeError(error);

    logEvent({ event: "export.scene.failed", productId: input.productId, detail });
    await database.update(scenes).set({ status: "failed", error: detail }).where(whereScene(input));
  }
}
