import { generateText, Output } from "ai";
import { z } from "zod";

import { serverEnvironment } from "@tulocal/environment/server";

import { fastModel } from "@/features/product/pipeline/models";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const TAVILY_MAX_RESULTS = 10;

const MAX_COMPARABLES = 4;

const MAX_RESULT_CONTENT_LENGTH = 600;

const MERCADO_LIBRE_DOMAINS = [
  "mercadolibre.com.ar",
  "articulo.mercadolibre.com.ar",
  "listado.mercadolibre.com.ar",
];

const tavilyResponseSchema = z.object({
  results: z.array(z.object({ title: z.string(), url: z.string(), content: z.string() })),
});

const researchSchema = z.object({
  comparables: z
    .array(
      z.object({ title: z.string(), url: z.string(), priceInArs: z.number().int().positive() }),
    )
    .max(MAX_COMPARABLES)
    .describe("Listings for the same kind of product with a price in Argentine pesos."),
  minimumPriceInArs: z.number().int().positive().nullable(),
  maximumPriceInArs: z.number().int().positive().nullable(),
});

export type Research = z.infer<typeof researchSchema>;

export type ResearchInput = {
  searchQuery: string;
  genericQuery: string;
  condition: "new" | "used";
};

type SearchResult = z.infer<typeof tavilyResponseSchema>["results"][number];

async function searchListings(query: string): Promise<SearchResult[]> {
  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnvironment.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      max_results: TAVILY_MAX_RESULTS,
      search_depth: "basic",
      include_domains: MERCADO_LIBRE_DOMAINS,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily responded ${response.status}`);
  }

  return tavilyResponseSchema.parse(await response.json()).results;
}

function mergeUniqueResults(groups: SearchResult[][]): SearchResult[] {
  const seenUrls = new Set<string>();
  const merged: SearchResult[] = [];

  for (const result of groups.flat()) {
    if (seenUrls.has(result.url)) {
      continue;
    }

    seenUrls.add(result.url);
    merged.push(result);
  }

  return merged;
}

function buildExtractionPrompt(input: ResearchInput, results: SearchResult[]): string {
  const conditionWord = input.condition === "used" ? "usado" : "nuevo";
  const listing = results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.title}\n${result.url}\n${result.content.slice(0, MAX_RESULT_CONTENT_LENGTH)}`,
    )
    .join("\n\n");

  return `These are Mercado Libre Argentina search results for a seller who wants to price this product: "${input.searchQuery}" (${conditionWord}), a ${input.genericQuery}.

Extract prices in Argentine pesos (ARS) for listings of the same kind of product in similar condition. Prefer the same brand and model when present, otherwise use listings with the same key specs (size, type, capacity). A result page can mention several listings with their prices, each one counts. Ignore accessories, spare parts, repairs and prices in USD. Ignore extreme outliers.

Return up to ${MAX_COMPARABLES} comparables with the price you read for each, plus a realistic minimumPriceInArs and maximumPriceInArs for this product. Use null for the range only if there is not a single usable price.

${listing}`;
}

export async function researchComparables(input: ResearchInput): Promise<Research> {
  const conditionWord = input.condition === "used" ? "usado" : "nuevo";
  const groups = await Promise.all([
    searchListings(`${input.searchQuery} ${conditionWord}`),
    searchListings(`${input.genericQuery} ${conditionWord}`),
  ]);
  const results = mergeUniqueResults(groups);

  if (results.length === 0) {
    return { comparables: [], minimumPriceInArs: null, maximumPriceInArs: null };
  }

  const { output } = await generateText({
    model: fastModel,
    output: Output.object({ schema: researchSchema }),
    prompt: buildExtractionPrompt(input, results),
  });

  return output;
}
