import { generateText, Output } from "ai";
import { z } from "zod";

import { serverEnvironment } from "@tulocal/environment/server";

import { visionModel } from "@/features/product/pipeline/models";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const TAVILY_MAX_RESULTS = 10;

const MAX_COMPARABLES = 4;

const tavilyResponseSchema = z.object({
  results: z.array(z.object({ title: z.string(), url: z.string(), content: z.string() })),
});

const researchSchema = z.object({
  comparables: z
    .array(
      z.object({ title: z.string(), url: z.string(), priceInArs: z.number().int().positive() }),
    )
    .max(MAX_COMPARABLES)
    .describe("Listings for the same product with a price in Argentine pesos."),
  minimumPriceInArs: z.number().int().positive().nullable(),
  maximumPriceInArs: z.number().int().positive().nullable(),
});

export type Research = z.infer<typeof researchSchema>;

export type ResearchInput = {
  searchQuery: string;
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
      include_domains: ["mercadolibre.com.ar", "articulo.mercadolibre.com.ar"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily responded ${response.status}`);
  }

  return tavilyResponseSchema.parse(await response.json()).results;
}

function buildExtractionPrompt(input: ResearchInput, results: SearchResult[]): string {
  const conditionWord = input.condition === "used" ? "usado" : "nuevo";
  const listing = results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.title}\n${result.url}\n${result.content.slice(0, 400)}`,
    )
    .join("\n\n");

  return `These are search results for "${input.searchQuery}" (${conditionWord}) in Argentina. Extract prices in Argentine pesos for the same product and model in similar condition.

Discard listings for a different model, accessories, spare parts or repairs. Ignore obvious outliers. Return up to ${MAX_COMPARABLES} comparables with the price you read, plus a realistic minimum and maximum. Use null when there is no usable price.

${listing}`;
}

export async function researchComparables(input: ResearchInput): Promise<Research> {
  const conditionWord = input.condition === "used" ? "usado" : "nuevo";
  const results = await searchListings(`${input.searchQuery} ${conditionWord}`);

  if (results.length === 0) {
    return { comparables: [], minimumPriceInArs: null, maximumPriceInArs: null };
  }

  const { output } = await generateText({
    model: visionModel,
    output: Output.object({ schema: researchSchema }),
    prompt: buildExtractionPrompt(input, results),
  });

  return output;
}
