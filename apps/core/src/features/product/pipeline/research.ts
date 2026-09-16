import { generateText, Output } from "ai";
import { z } from "zod";

import { serverEnvironment } from "@tulocal/environment/server";

import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import { researchModel } from "@/features/product/pipeline/models";
import type { ProductCategory } from "@/features/product/category";
import type { ProductCondition } from "@/features/product/condition";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const TAVILY_MAX_RESULTS = 10;

const TAVILY_CHUNKS_PER_SOURCE = 3;

const MAX_COMPARABLES = 8;

const MAX_RESULT_CONTENT_LENGTH = 1200;

const MERCADO_LIBRE_DOMAINS = ["mercadolibre.com.ar"];

const ARGENTINA_COUNTRY = "argentina";

const ARGENTINE_HOSTNAME_SUFFIX = ".ar";

const ALLOWED_FOREIGN_HOSTNAMES = ["facebook.com", "www.facebook.com"];

const CONDITION_SEARCH_WORDS: Record<ProductCondition, string> = {
  new: "nuevo",
  like_new: "usado",
  good: "usado",
  worn: "usado",
};

const tavilyResponseSchema = z.object({
  results: z.array(z.object({ title: z.string(), url: z.url(), content: z.string() })),
});

export type Comparable = {
  title: string;
  url: string;
  priceInArs: number;
};

export type Research = {
  comparables: Comparable[];
};

export type ResearchInput = {
  searchQuery: string;
  genericQuery: string;
  category: ProductCategory;
  brand: string | null;
  model: string | null;
  attributes: string[];
  condition: ProductCondition;
};

type SearchInput = {
  query: string;
  includeDomains: string[] | null;
  country: string | null;
};

type SearchResult = z.infer<typeof tavilyResponseSchema>["results"][number];

type TavilySearchBody = {
  query: string;
  max_results: number;
  search_depth: "advanced";
  chunks_per_source: number;
  include_domains?: string[];
  country?: string;
};

type ExtractedComparable = {
  resultIndex: number;
  title: string;
  priceInArs: number;
};

function buildSearchBody(input: SearchInput): string {
  const body: TavilySearchBody = {
    query: input.query,
    max_results: TAVILY_MAX_RESULTS,
    search_depth: "advanced",
    chunks_per_source: TAVILY_CHUNKS_PER_SOURCE,
  };

  if (input.includeDomains !== null) {
    body.include_domains = input.includeDomains;
  }

  if (input.country !== null) {
    body.country = input.country;
  }

  return JSON.stringify(body);
}

async function searchListings(input: SearchInput): Promise<SearchResult[]> {
  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnvironment.TAVILY_API_KEY}`,
    },
    body: buildSearchBody(input),
  });

  if (!response.ok) {
    throw new Error(`Tavily responded ${response.status}`);
  }

  return tavilyResponseSchema.parse(await response.json()).results;
}

function isArgentineResult(result: SearchResult): boolean {
  const hostname = new URL(result.url).hostname;

  return (
    hostname.endsWith(ARGENTINE_HOSTNAME_SUFFIX) || ALLOWED_FOREIGN_HOSTNAMES.includes(hostname)
  );
}

function mergeUniqueResults(groups: SearchResult[][]): SearchResult[] {
  const seenUrls = new Set<string>();
  const merged: SearchResult[] = [];

  for (const result of groups.flat()) {
    if (seenUrls.has(result.url) || !isArgentineResult(result)) {
      continue;
    }

    seenUrls.add(result.url);
    merged.push(result);
  }

  return merged;
}

function buildExtractionSchema(resultCount: number) {
  return z.object({
    comparables: z
      .array(
        z.object({
          resultIndex: z
            .number()
            .int()
            .min(1)
            .max(resultCount)
            .describe("The [n] number of the search result the listing was read from."),
          title: z.string().describe("Title of the listing as written in the result."),
          priceInArs: z.number().int().positive(),
        }),
      )
      .max(MAX_COMPARABLES)
      .describe(
        "Listings of the same product with a full price in Argentine pesos. Empty when nothing matches.",
      ),
  });
}

function describeProduct(input: ResearchInput): string {
  const lines = [
    `Kind of product: ${input.genericQuery} (category ${CATEGORY_LABELS[input.category]})`,
    `Brand or character: ${input.brand ?? "none visible"}`,
    `Model: ${input.model ?? "none visible"}`,
    `Condition: ${CONDITION_LABELS[input.condition]}`,
    `Visible attributes: ${input.attributes.join("; ")}`,
  ];

  return lines.join("\n");
}

function buildExtractionPrompt(input: ResearchInput, results: SearchResult[]): string {
  const listing = results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.title}\n${result.url}\n${result.content.slice(0, MAX_RESULT_CONTENT_LENGTH)}`,
    )
    .join("\n\n");

  return `A seller in Argentina wants to price this product, searched as "${input.searchQuery}":
${describeProduct(input)}

Below are web search results. Extract up to ${MAX_COMPARABLES} listings that are comparable to this product, each with its full price in Argentine pesos (ARS).

A listing is comparable only when it is the same kind of product (a t-shirt is not a hoodie, a jersey, a shirt or a dress; a phone is not a case or a charger) and, when the product has a brand, model, character or licensed print, the listing has the same one. A listing that merely shares a word, a color or a category with the product is not comparable. When in doubt, leave it out. Returning an empty list is the right answer when nothing truly matches. Prefer listings in a similar condition.

One search result page can contain several listings with prices: each matching one counts as its own comparable with the same resultIndex, and the title is the listing's own title, not the page title.

How prices are written in Argentina: the dot is a thousands separator, so "$ 1.234.567" is 1234567 and "$ 99.000" is 99000. "6 cuotas de $ 22.273" is an installment amount, never a price: take the full price written next to it. Ignore prices in USD, dollars or euros, and ignore accessories, spare parts, repairs and services. Skip a listing when you are not sure which number is its price.

${listing}`;
}

function resolveComparables(
  extracted: ExtractedComparable[],
  results: SearchResult[],
): Comparable[] {
  const comparables: Comparable[] = [];

  for (const comparable of extracted) {
    const result = results[comparable.resultIndex - 1];

    if (result === undefined) {
      continue;
    }

    comparables.push({
      title: comparable.title,
      url: result.url,
      priceInArs: comparable.priceInArs,
    });
  }

  return comparables;
}

export async function researchComparables(input: ResearchInput): Promise<Research> {
  const conditionWord = CONDITION_SEARCH_WORDS[input.condition];
  const groups = await Promise.all([
    searchListings({
      query: `${input.searchQuery} ${conditionWord}`,
      includeDomains: MERCADO_LIBRE_DOMAINS,
      country: null,
    }),
    searchListings({
      query: `${input.genericQuery} ${conditionWord}`,
      includeDomains: MERCADO_LIBRE_DOMAINS,
      country: null,
    }),
    searchListings({
      query: `${input.searchQuery} ${conditionWord} precio`,
      includeDomains: null,
      country: ARGENTINA_COUNTRY,
    }),
  ]);
  const results = mergeUniqueResults(groups);

  if (results.length === 0) {
    return { comparables: [] };
  }

  const { output } = await generateText({
    model: researchModel,
    output: Output.object({ schema: buildExtractionSchema(results.length) }),
    prompt: buildExtractionPrompt(input, results),
  });

  return { comparables: resolveComparables(output.comparables, results) };
}
