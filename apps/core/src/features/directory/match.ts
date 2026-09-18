import { z } from "zod";

import { CATEGORY_LABELS } from "@/features/product/category";
import type { DirectoryProduct, DirectoryStore } from "@/features/directory/listing";

const QUERY_MAX_LENGTH = 80;

const PRODUCT_RESULTS_LIMIT = 48;

const PRIMARY_MATCH_WEIGHT = 2;

const PLURAL_MINIMUM_LENGTH = 4;

const directoryQuerySchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? (value[0] ?? "") : value))
  .transform((value) => value.trim().slice(0, QUERY_MAX_LENGTH))
  .catch("");

export type DirectoryResults = {
  stores: DirectoryStore[];
  products: DirectoryProduct[];
};

type SearchableText = {
  primary: string;
  secondary: string;
};

type PromotedEntry = {
  promotionRank: number;
};

type RankedEntry<Entry> = {
  entry: Entry;
  score: number;
};

export function parseDirectoryQuery(raw: string | string[] | undefined): string {
  return directoryQuerySchema.parse(raw ?? "");
}

export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function splitSearchTerms(query: string): string[] {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

function listTermVariants(term: string): string[] {
  if (term.length < PLURAL_MINIMUM_LENGTH || !term.endsWith("s")) {
    return [term];
  }

  const withoutFinalS = term.slice(0, -1);

  if (!term.endsWith("es")) {
    return [term, withoutFinalS];
  }

  return [term, withoutFinalS, term.slice(0, -2)];
}

function containsTerm(text: string, term: string): boolean {
  return listTermVariants(term).some((variant) => text.includes(variant));
}

function joinSearchable(parts: (string | null)[]): string {
  return normalizeSearchText(parts.filter((part) => part !== null).join(" "));
}

function describeStore(store: DirectoryStore): SearchableText {
  return {
    primary: joinSearchable([store.name, store.handle]),
    secondary: joinSearchable([store.description, store.locationName]),
  };
}

function describeProduct(product: DirectoryProduct): SearchableText {
  return {
    primary: joinSearchable([product.title, product.brand, product.model]),
    secondary: joinSearchable([
      product.description,
      product.category === null ? null : CATEGORY_LABELS[product.category],
    ]),
  };
}

function scoreSearchable(searchable: SearchableText, terms: string[]): number {
  let score = 0;

  for (const term of terms) {
    if (containsTerm(searchable.primary, term)) {
      score += PRIMARY_MATCH_WEIGHT;
      continue;
    }

    if (!containsTerm(searchable.secondary, term)) {
      return 0;
    }

    score += 1;
  }

  return score;
}

function rankEntries<Entry extends PromotedEntry>(
  entries: Entry[],
  describe: (entry: Entry) => SearchableText,
  terms: string[],
): Entry[] {
  return entries
    .map((entry): RankedEntry<Entry> => ({ entry, score: scoreSearchable(describe(entry), terms) }))
    .filter((ranked) => ranked.score > 0)
    .sort(
      (first, second) =>
        second.score - first.score || second.entry.promotionRank - first.entry.promotionRank,
    )
    .map((ranked) => ranked.entry);
}

export function searchDirectory(stores: DirectoryStore[], query: string): DirectoryResults {
  const terms = splitSearchTerms(query);

  if (terms.length === 0) {
    return { stores, products: [] };
  }

  const allProducts = stores.flatMap((store) => store.products);

  return {
    stores: rankEntries(stores, describeStore, terms),
    products: rankEntries(allProducts, describeProduct, terms).slice(0, PRODUCT_RESULTS_LIMIT),
  };
}
