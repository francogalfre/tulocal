import {
  analyzeProduct,
  checkImageFidelity,
  generateProductImages,
  researchPrices,
  suggestPrices,
  type ImageInput,
} from "@tulocal/ai";
import type { Database } from "@tulocal/db";
import { product, productImage, type PipelineSteps } from "@tulocal/db/schema/index";
import { put } from "@vercel/blob";
import { asc, eq } from "drizzle-orm";

async function fetchImage(url: string): Promise<ImageInput> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo descargar la imagen (${response.status})`);
  return {
    data: new Uint8Array(await response.arrayBuffer()),
    mediaType: response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg",
  };
}

export async function runPriceResearch({
  db,
  productId,
  env,
}: {
  db: Database;
  productId: string;
  env: { TAVILY_API_KEY: string };
}) {
  const current = await db.query.product.findFirst({ where: eq(product.id, productId) });
  if (!current) throw new Error("Producto no encontrado");
  if (!current.searchQuery) throw new Error("El producto todavía no fue analizado");

  const research = await researchPrices({
    query: current.searchQuery,
    tavilyApiKey: env.TAVILY_API_KEY,
    condition: current.condition,
  });

  const suggested = suggestPrices({
    qualityPercent: current.qualityPercent,
    marketMin: research.minPrice,
    marketMax: research.maxPrice,
  });

  await db
    .update(product)
    .set({
      marketMinPrice: research.minPrice,
      marketMaxPrice: research.maxPrice,
      marketSummary: research.summary,
      marketSources: research.sources,
      ...(suggested && current.listPrice === null ? { listPrice: suggested.listPrice } : {}),
      ...(suggested && current.minPrice === null ? { minPrice: suggested.minPrice } : {}),
      pipelineSteps: { ...current.pipelineSteps, prices: "done" },
      pipelineError: null,
    })
    .where(eq(product.id, productId));

  return research;
}

export async function runProductPipeline({
  db,
  productId,
  env,
}: {
  db: Database;
  productId: string;
  env: { TAVILY_API_KEY: string };
}) {
  const steps: PipelineSteps = { analyze: "running", images: "pending", prices: "pending" };
  const save = (values: Partial<typeof product.$inferInsert>) =>
    db.update(product).set(values).where(eq(product.id, productId));

  try {
    const current = await db.query.product.findFirst({ where: eq(product.id, productId) });
    if (!current) throw new Error("Producto no encontrado");

    const originals = await db.query.productImage.findMany({
      where: eq(productImage.productId, productId),
      orderBy: asc(productImage.sortOrder),
    });
    const originalRows = originals.filter((image) => image.kind === "original").slice(0, 5);
    if (originalRows.length === 0) throw new Error("El producto no tiene fotos");

    await save({
      status: "processing",
      pipelineStage: "analyzing",
      pipelineSteps: steps,
      pipelineError: null,
    });

    const originalImages = await Promise.all(originalRows.map((row) => fetchImage(row.url)));

    const analysis = await analyzeProduct({
      images: originalImages,
      hint: current.hint ?? undefined,
    });
    steps.analyze = "done";
    steps.images = "running";
    steps.prices = "running";

    await save({
      title: analysis.title,
      description: analysis.description,
      category: analysis.category,
      brand: analysis.brand,
      model: analysis.model,
      condition: analysis.condition,
      qualityPercent: analysis.qualityPercent,
      conditionNotes: analysis.conditionNotes,
      attributes: analysis.attributes,
      dominantColor: analysis.dominantColor,
      sellingPoints: analysis.sellingPoints,
      searchQuery: analysis.searchQuery,
      pipelineStage: "generating",
      pipelineSteps: { ...steps },
    });

    const source = originalImages[analysis.bestImageIndex] ?? originalImages[0]!;

    const imagesTask = (async () => {
      const variantPromises = generateProductImages({
        source,
        category: analysis.category,
        dominantColor: analysis.dominantColor,
        conditionNotes: analysis.conditionNotes,
      });

      const results = await Promise.all(
        variantPromises.map(async (variantPromise, sortOrder) => {
          const variant = await variantPromise;
          if (!variant.ok) {
            return { ok: false as const, kind: variant.kind, error: variant.error };
          }

          const fidelity = await checkImageFidelity({
            original: source,
            candidate: { data: variant.data, mediaType: variant.mediaType },
            conditionNotes: analysis.conditionNotes,
          });

          const extension = variant.mediaType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
          const blob = await put(
            `products/${productId}/${variant.kind}-${Date.now()}.${extension}`,
            Buffer.from(variant.data),
            { access: "public", contentType: variant.mediaType },
          );

          await db.insert(productImage).values({
            productId,
            url: blob.url,
            kind: variant.kind,
            fidelityPassed: fidelity.passes,
            fidelityIssues: fidelity.issues,
            visible: fidelity.passes,
            sortOrder,
          });

          return { ok: true as const, kind: variant.kind };
        }),
      );

      const failures = results.filter((variantResult) => !variantResult.ok);
      steps.images = failures.length === results.length ? "failed" : "done";
      await save({ pipelineSteps: { ...steps } });

      if (failures.length === results.length) {
        throw new Error(failures.map((failure) => `${failure.kind}: ${failure.error}`).join(" | "));
      }
    })();

    const pricesTask = (async () => {
      const research = await researchPrices({
        query: analysis.searchQuery,
        tavilyApiKey: env.TAVILY_API_KEY,
        condition: analysis.condition,
      });
      const suggested = suggestPrices({
        qualityPercent: analysis.qualityPercent,
        marketMin: research.minPrice,
        marketMax: research.maxPrice,
      });

      steps.prices = "done";
      await save({
        marketMinPrice: research.minPrice,
        marketMaxPrice: research.maxPrice,
        marketSummary: research.summary,
        marketSources: research.sources,
        ...(suggested && current.listPrice === null ? { listPrice: suggested.listPrice } : {}),
        ...(suggested && current.minPrice === null ? { minPrice: suggested.minPrice } : {}),
        pipelineSteps: { ...steps },
      });
    })();

    const [imagesResult, pricesResult] = await Promise.allSettled([imagesTask, pricesTask]);
    if (pricesResult.status === "rejected") {
      steps.prices = "failed";
      await save({ pipelineSteps: { ...steps } });
    }

    const images = await db.query.productImage.findMany({
      where: eq(productImage.productId, productId),
    });

    const coverPriority = ["studio", "hero", "lifestyle", "original"] as const;
    const cover = coverPriority
      .map((kind) => images.find((image) => image.kind === kind && image.fidelityPassed !== false))
      .find(Boolean);

    const errors = [imagesResult, pricesResult]
      .filter(
        (settledResult): settledResult is PromiseRejectedResult =>
          settledResult.status === "rejected",
      )
      .map((rejectedResult) =>
        rejectedResult.reason instanceof Error
          ? rejectedResult.reason.message
          : String(rejectedResult.reason),
      );

    await save({
      status: "ready",
      pipelineStage: "ready",
      coverImageId: cover?.id ?? null,
      pipelineError: errors.length ? errors.join(" | ") : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    for (const key of Object.keys(steps) as (keyof PipelineSteps)[]) {
      if (steps[key] === "running") steps[key] = "failed";
    }
    await save({
      status: "failed",
      pipelineStage: "failed",
      pipelineSteps: steps,
      pipelineError: message,
    });
  }
}
