import { and, asc, eq, ne } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { comparables } from "@tulocal/database/schema/comparables";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { uploadBlob } from "@tulocal/storage/blob";

import { identifyProduct } from "@/features/product/pipeline/identify";
import { generateProductImages } from "@/features/product/pipeline/imagine";
import { downloadPhoto, selectSourcePhoto } from "@/features/product/pipeline/photos";
import { suggestPrices } from "@/features/product/pipeline/pricing";
import { researchComparables } from "@/features/product/pipeline/research";
import { writeListing } from "@/features/product/pipeline/write";
import type { GeneratedImage } from "@/features/product/pipeline/imagine";
import type { Identification } from "@/features/product/pipeline/identify";
import type { Photo } from "@/features/product/pipeline/photos";
import type { Research } from "@/features/product/pipeline/research";
import { logEvent } from "@/lib/logger";

const ORIGINAL_IMAGE_KIND = "original";

const EMPTY_RESEARCH: Research = {
  comparables: [],
  minimumPriceInArs: null,
  maximumPriceInArs: null,
};

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Falló el procesamiento del producto";
}

function detectComparableSource(url: string): "mercadolibre" | "facebook" | "other" {
  const hostname = new URL(url).hostname;

  if (hostname.includes("mercadolibre")) {
    return "mercadolibre";
  }

  if (hostname.includes("facebook")) {
    return "facebook";
  }

  return "other";
}

function buildImageExtension(mediaType: string): string {
  return mediaType === "image/jpeg" ? "jpg" : (mediaType.split("/")[1] ?? "png");
}

async function clearPreviousRun(productId: string): Promise<void> {
  await database.batch([
    database
      .delete(images)
      .where(and(eq(images.productId, productId), ne(images.kind, ORIGINAL_IMAGE_KIND))),
    database.delete(comparables).where(eq(comparables.productId, productId)),
    database
      .update(products)
      .set({ status: "processing", pipelineStage: "identifying", pipelineError: null })
      .where(eq(products.id, productId)),
  ]);
}

async function storeGeneratedImages(productId: string, generated: GeneratedImage[]): Promise<void> {
  const stored = await Promise.all(
    generated.map((image) =>
      uploadBlob({
        pathname: `products/${productId}/${image.kind}.${buildImageExtension(image.mediaType)}`,
        body: new Blob([image.bytes.slice()], { type: image.mediaType }),
        contentType: image.mediaType,
      }),
    ),
  );

  if (stored.length === 0) {
    return;
  }

  await database.insert(images).values(
    stored.map((blob, sortOrder) => ({
      productId,
      url: blob.url,
      kind: generated[sortOrder]?.kind ?? "contextual",
      sortOrder,
    })),
  );
}

async function researchSafely(
  identification: Identification,
  productId: string,
): Promise<Research> {
  try {
    return await researchComparables({
      searchQuery: identification.searchQuery,
      genericQuery: identification.genericQuery,
      condition: identification.condition,
    });
  } catch (error) {
    logEvent({ event: "pipeline.research.failed", productId, detail: describeError(error) });
    return EMPTY_RESEARCH;
  }
}

async function storeResearch(
  productId: string,
  identification: Identification,
  research: Research,
): Promise<void> {
  if (research.comparables.length > 0) {
    await database.insert(comparables).values(
      research.comparables.map((comparable) => ({
        productId,
        title: comparable.title,
        url: comparable.url,
        priceInArs: comparable.priceInArs,
        source: detectComparableSource(comparable.url),
      })),
    );
  }

  const suggestion = suggestPrices({
    minimumPriceInArs: research.minimumPriceInArs,
    maximumPriceInArs: research.maximumPriceInArs,
    condition: identification.condition,
  });

  await database
    .update(products)
    .set({
      suggestedMinimumPriceInArs: research.minimumPriceInArs,
      suggestedMaximumPriceInArs: research.maximumPriceInArs,
      listPriceInArs: suggestion?.listPriceInArs ?? null,
      floorPriceInArs: suggestion?.floorPriceInArs ?? null,
    })
    .where(eq(products.id, productId));
}

async function produceImages(
  productId: string,
  photos: Photo[],
  identification: Identification,
): Promise<void> {
  const source = selectSourcePhoto(photos, identification.bestPhotoIndex);
  const generated = await generateProductImages({ source, identification });

  await storeGeneratedImages(productId, generated);
}

async function produceListing(productId: string, identification: Identification): Promise<void> {
  const listing = await writeListing(identification);

  await database
    .update(products)
    .set({ title: listing.title, description: listing.description })
    .where(eq(products.id, productId));
}

async function produceResearch(productId: string, identification: Identification): Promise<void> {
  const research = await researchSafely(identification, productId);

  await storeResearch(productId, identification, research);
}

async function runStages(productId: string): Promise<void> {
  const originals = await database.query.images.findMany({
    where: and(eq(images.productId, productId), eq(images.kind, ORIGINAL_IMAGE_KIND)),
    orderBy: [asc(images.sortOrder)],
  });

  if (originals.length === 0) {
    throw new Error("El producto no tiene fotos");
  }

  const photos = await Promise.all(originals.map((original) => downloadPhoto(original.url)));
  const identification = await identifyProduct(photos);

  await database
    .update(products)
    .set({
      condition: identification.condition,
      conditionNotes: identification.conditionNotes.join(". "),
      attributes: identification.attributes,
      pipelineStage: "imaging",
    })
    .where(eq(products.id, productId));
  await Promise.all([
    produceImages(productId, photos, identification),
    produceListing(productId, identification),
    produceResearch(productId, identification),
  ]);
  await database
    .update(products)
    .set({ status: "review", pipelineStage: "completed" })
    .where(eq(products.id, productId));
}

export async function runPipeline(productId: string): Promise<void> {
  logEvent({ event: "pipeline.started", productId });

  try {
    await clearPreviousRun(productId);
    await runStages(productId);
    logEvent({ event: "pipeline.completed", productId });
  } catch (error) {
    const detail = describeError(error);

    logEvent({ event: "pipeline.failed", productId, detail });
    await database
      .update(products)
      .set({ status: "failed", pipelineError: detail })
      .where(eq(products.id, productId));
  }
}
