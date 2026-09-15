import {
  analyzeProduct,
  checkImageFidelity,
  generateProductImages,
  researchPrices,
  type ImageInput,
  type ProductAnalysis,
} from "@tulocal/ai";
import type { Database } from "@tulocal/db";
import { product, productImage, type PipelineSteps } from "@tulocal/db/schema/index";
import { put } from "@vercel/blob";
import { asc, eq } from "drizzle-orm";

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

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
  const suggested = suggestPrices(
    { qualityPercent: current.qualityPercent ?? 70 },
    research.minPrice,
    research.maxPrice,
  );
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

function suggestPrices(
  analysis: Pick<ProductAnalysis, "qualityPercent">,
  marketMin: number | null,
  marketMax: number | null,
) {
  if (marketMin === null && marketMax === null) return null;
  const min = marketMin ?? marketMax!;
  const max = marketMax ?? marketMin!;
  const quality = (analysis.qualityPercent ?? 70) / 100;
  const step = max >= 100_000 ? 1000 : 100;
  const listPrice = roundTo(min + (max - min) * quality, step);
  return { listPrice, minPrice: roundTo(listPrice * 0.8, step) };
}

/**
 * Runs the whole AI pipeline for one product, writing progress to the row so
 * the dashboard can poll it. Never throws: failures land in `pipelineError`.
 */
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

    // 1. Vision analysis
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
      searchQuery: analysis.searchQuery,
      pipelineStage: "generating",
      pipelineSteps: { ...steps },
    });

    const source = originalImages[analysis.bestImageIndex] ?? originalImages[0]!;

    // 2a. Image variants + fidelity guard, each inserted as soon as it finishes
    const imagesTask = (async () => {
      const results = await Promise.all(
        generateProductImages({ source, category: analysis.category }).map(
          async (variantPromise, index) => {
            const variant = await variantPromise;
            if (!variant.ok)
              return { ok: false as const, kind: variant.kind, error: variant.error };
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
              sortOrder: index,
            });
            return { ok: true as const, kind: variant.kind };
          },
        ),
      );
      const failures = results.filter((r) => !r.ok);
      steps.images = failures.length === results.length ? "failed" : "done";
      await save({ pipelineSteps: { ...steps } });
      if (failures.length === results.length) {
        throw new Error(failures.map((f) => `${f.kind}: ${f.error}`).join(" | "));
      }
    })();

    // 2b. Market prices
    const pricesTask = (async () => {
      const research = await researchPrices({
        query: analysis.searchQuery,
        tavilyApiKey: env.TAVILY_API_KEY,
        condition: analysis.condition,
      });
      const suggested = suggestPrices(analysis, research.minPrice, research.maxPrice);
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

    // 3. Cover selection
    const images = await db.query.productImage.findMany({
      where: eq(productImage.productId, productId),
    });
    const priority = ["studio", "hero", "enhanced", "lifestyle", "original"] as const;
    const cover = priority
      .map((kind) => images.find((image) => image.kind === kind && image.fidelityPassed !== false))
      .find(Boolean);

    const errors = [imagesResult, pricesResult]
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));

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
