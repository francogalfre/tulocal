import { generateText, Output } from "ai";
import { z } from "zod";

import { CATEGORY_LABELS } from "@/features/product/category";
import { researchModel } from "@/features/product/pipeline/models";
import { searchWeb } from "@/features/product/pipeline/search";
import type { ProductCategory } from "@/features/product/category";
import type { SearchResult } from "@/features/product/pipeline/search";

const MAX_FACTS = 8;

const FACT_MAX_LENGTH = 200;

const MAX_RESULT_CONTENT_LENGTH = 1200;

const SPECIFICATIONS_QUERY_SUFFIX = "especificaciones ficha técnica";

const VARIANTS_QUERY_SUFFIX = "versiones diferencias qué incluye";

const PRICE_WORDS_PATTERN = /\$|\bpesos\b|\busd\b|\bd[oó]lares\b|\beuros?\b/iu;

const HAS_MODEL_FACTS: Record<ProductCategory, boolean> = {
  celulares: true,
  computacion: true,
  audio: true,
  tv_video: true,
  fotografia: true,
  videojuegos: true,
  electrodomesticos: true,
  cocina: true,
  muebles: false,
  decoracion: false,
  iluminacion: false,
  jardin: false,
  herramientas: true,
  deportes: true,
  bicicletas: true,
  ropa: false,
  calzado: false,
  accesorios: false,
  belleza: false,
  bebes: true,
  juguetes: true,
  libros: false,
  instrumentos: true,
  vehiculos: true,
  mascotas: false,
  otros: false,
};

const factsSchema = z.object({
  facts: z
    .array(z.string().max(FACT_MAX_LENGTH))
    .max(MAX_FACTS)
    .describe(
      "Up to 8 one-sentence facts in Rioplatense Spanish about the model in general. Empty when the results do not clearly describe this model.",
    ),
});

export type FactsInput = {
  category: ProductCategory;
  brand: string | null;
  model: string | null;
  searchQuery: string;
};

function isResearchable(input: FactsInput): boolean {
  if (!HAS_MODEL_FACTS[input.category]) {
    return false;
  }

  return input.brand !== null || input.model !== null;
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

function isPriceFree(fact: string): boolean {
  return !PRICE_WORDS_PATTERN.test(fact);
}

function describeModel(input: FactsInput): string {
  const name = [input.brand, input.model].filter((part) => part !== null).join(" ");

  return `${name} (${CATEGORY_LABELS[input.category]})`;
}

function buildFactsPrompt(input: FactsInput, results: SearchResult[]): string {
  const listing = results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.title}\n${result.url}\n${result.content.slice(0, MAX_RESULT_CONTENT_LENGTH)}`,
    )
    .join("\n\n");

  return `A seller in Argentina is listing this product: ${describeModel(input)}, searched as "${input.searchQuery}". Below are web search results about the model.

Write up to ${MAX_FACTS} facts about the MODEL IN GENERAL that help a shop assistant answer buyer questions: which variants or versions exist and how to tell them apart, specs that vary between variants (storage, size, power), what the product usually includes in the box, the release year, and common things a buyer checks on a used unit.

Rules: one short sentence per fact, in Rioplatense Spanish with voseo, no bullet characters. Only state what the results say; when the results do not clearly describe this model, return an empty list. Never claim anything about this specific unit (its capacity, color, accessories or condition): describe the model, not the item. Never mention prices, currency, offers or where to buy. Write quantities with the unit attached and without thousands separators: 500GB, 1TB, 5000 mAh.

${listing}`;
}

export async function researchFacts(input: FactsInput): Promise<string[]> {
  if (!isResearchable(input)) {
    return [];
  }

  const groups = await Promise.all([
    searchWeb({
      query: `${input.searchQuery} ${SPECIFICATIONS_QUERY_SUFFIX}`,
      includeDomains: null,
      country: null,
    }),
    searchWeb({
      query: `${input.searchQuery} ${VARIANTS_QUERY_SUFFIX}`,
      includeDomains: null,
      country: null,
    }),
  ]);
  const results = mergeUniqueResults(groups);

  if (results.length === 0) {
    return [];
  }

  const { output } = await generateText({
    model: researchModel,
    output: Output.object({ schema: factsSchema }),
    prompt: buildFactsPrompt(input, results),
  });

  return output.facts.filter(isPriceFree);
}
