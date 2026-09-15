import { generateText, Output } from "ai";

import { pricingStep, roundTo, type ImageInput } from "../utils/format";
import { MODELS } from "../utils/models";
import { DEFAULT_QUALITY_PERCENT, MIN_PRICE_RATIO, MIN_USABLE_SEARCH_RESULTS } from "./constants";
import { analysisPrompt, priceExtractionPrompt } from "./prompts";
import {
  analysisSchema,
  priceResearchSchema,
  type PriceResearch,
  type TavilyResult,
} from "./schema";

export {
  analysisSchema,
  priceResearchSchema,
  type PriceResearch,
  type ProductAnalysis,
} from "./schema";

export async function analyzeProduct({ images, hint }: { images: ImageInput[]; hint?: string }) {
  const result = await generateText({
    model: MODELS.vision,
    output: Output.object({ schema: analysisSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: analysisPrompt(hint) },
          ...images.map((image) => ({
            type: "image" as const,
            image: image.data,
            mediaType: image.mediaType,
          })),
        ],
      },
    ],
  });

  return result.output;
}

async function tavilySearch(
  apiKey: string,
  query: string,
  options: { includeDomains?: string[] } = {},
): Promise<TavilyResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      max_results: 10,
      search_depth: "basic",
      ...(options.includeDomains ? { include_domains: options.includeDomains } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Tavily ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const json = (await response.json()) as { results?: TavilyResult[] };
  return json.results ?? [];
}

export async function researchPrices({
  query,
  tavilyApiKey,
  condition,
}: {
  query: string;
  tavilyApiKey: string;
  condition: "new" | "used";
}): Promise<PriceResearch> {
  if (!tavilyApiKey) throw new Error("TAVILY_API_KEY no configurada");

  const conditionWord = condition === "used" ? "usado" : "nuevo";

  let results = await tavilySearch(tavilyApiKey, `${query} ${conditionWord}`, {
    includeDomains: ["mercadolibre.com.ar", "articulo.mercadolibre.com.ar"],
  });
  if (results.length < MIN_USABLE_SEARCH_RESULTS) {
    const extraResults = await tavilySearch(
      tavilyApiKey,
      `${query} ${conditionWord} precio argentina`,
    );
    results = [...results, ...extraResults];
  }
  if (results.length === 0) throw new Error("Sin resultados de búsqueda");

  const listing = results
    .slice(0, 16)
    .map((searchResult, index) => {
      return `[${index + 1}] ${searchResult.title}\n${searchResult.url}\n${searchResult.content.slice(0, 400)}`;
    })
    .join("\n\n");

  const result = await generateText({
    model: MODELS.vision,
    output: Output.object({ schema: priceResearchSchema }),
    prompt: priceExtractionPrompt({ query, conditionWord, listing }),
  });

  return result.output;
}

export function suggestPrices({
  qualityPercent,
  marketMin,
  marketMax,
}: {
  qualityPercent: number | null;
  marketMin: number | null;
  marketMax: number | null;
}) {
  if (marketMin === null && marketMax === null) return null;

  const lowerBound = marketMin ?? marketMax!;
  const upperBound = marketMax ?? marketMin!;
  const qualityRatio = (qualityPercent ?? DEFAULT_QUALITY_PERCENT) / 100;
  const roundingStep = pricingStep(upperBound);

  const listPrice = roundTo(lowerBound + (upperBound - lowerBound) * qualityRatio, roundingStep);
  const minPrice = roundTo(listPrice * MIN_PRICE_RATIO, roundingStep);

  return { listPrice, minPrice };
}
