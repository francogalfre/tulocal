import { z } from "zod";

import type { products } from "@tulocal/database/schema/products";

export type CatalogProduct = {
  id: string;
  title: string | null;
  category: string | null;
  listPriceInArs: number | null;
  condition: "new" | "used" | null;
  status: typeof products.$inferSelect.status;
  coverUrl: string | null;
  createdAt: Date;
};

export type CatalogCategory = {
  name: string;
  count: number;
  coverUrl: string | null;
};

const stringListSchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : [value]))
  .transform((values) =>
    values.flatMap((value) => value.split(",")).filter((value) => value !== ""),
  )
  .catch([]);

const optionalPriceSchema = z.coerce.number().int().positive().nullable().catch(null);

const catalogFiltersSchema = z.object({
  condition: z.enum(["all", "new", "used"]).catch("all"),
  status: z.enum(["all", "published", "review", "sold"]).catch("all"),
  sort: z.enum(["newest", "cheapest", "priciest"]).catch("newest"),
  category: stringListSchema,
  min: optionalPriceSchema,
  max: optionalPriceSchema,
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

export type RawCatalogFilters = {
  condition?: string | string[];
  status?: string | string[];
  sort?: string | string[];
  category?: string | string[];
  min?: string | string[];
  max?: string | string[];
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  condition: "all",
  status: "all",
  sort: "newest",
  category: [],
  min: null,
  max: null,
};

const REVIEW_STATUSES = new Set(["processing", "review", "failed"]);

export function parseCatalogFilters(raw: RawCatalogFilters): CatalogFilters {
  return catalogFiltersSchema.parse({
    condition: raw.condition,
    status: raw.status,
    sort: raw.sort,
    category: raw.category ?? [],
    min: Array.isArray(raw.min) ? raw.min[0] : raw.min,
    max: Array.isArray(raw.max) ? raw.max[0] : raw.max,
  });
}

export function serializeCatalogFilters(filters: CatalogFilters): string {
  const parameters = new URLSearchParams();

  if (filters.condition !== "all") {
    parameters.set("condition", filters.condition);
  }

  if (filters.status !== "all") {
    parameters.set("status", filters.status);
  }

  if (filters.sort !== "newest") {
    parameters.set("sort", filters.sort);
  }

  for (const category of filters.category) {
    parameters.append("category", category);
  }

  if (filters.min !== null) {
    parameters.set("min", String(filters.min));
  }

  if (filters.max !== null) {
    parameters.set("max", String(filters.max));
  }

  return parameters.toString();
}

export function countActiveFilters(filters: CatalogFilters): number {
  return [
    filters.condition !== "all",
    filters.status !== "all",
    filters.sort !== "newest",
    filters.category.length > 0,
    filters.min !== null || filters.max !== null,
  ].filter(Boolean).length;
}

function matchesCondition(
  product: CatalogProduct,
  condition: CatalogFilters["condition"],
): boolean {
  return condition === "all" || product.condition === condition;
}

function matchesStatus(product: CatalogProduct, status: CatalogFilters["status"]): boolean {
  if (status === "all") {
    return true;
  }

  if (status === "review") {
    return REVIEW_STATUSES.has(product.status);
  }

  return product.status === status;
}

function matchesCategory(product: CatalogProduct, categories: string[]): boolean {
  return (
    categories.length === 0 || (product.category !== null && categories.includes(product.category))
  );
}

function matchesPrice(product: CatalogProduct, filters: CatalogFilters): boolean {
  if (filters.min === null && filters.max === null) {
    return true;
  }

  if (product.listPriceInArs === null) {
    return false;
  }

  const isAboveMinimum = filters.min === null || product.listPriceInArs >= filters.min;
  const isBelowMaximum = filters.max === null || product.listPriceInArs <= filters.max;

  return isAboveMinimum && isBelowMaximum;
}

function compareByFilters(sort: CatalogFilters["sort"]) {
  return (first: CatalogProduct, second: CatalogProduct): number => {
    if (sort === "newest") {
      return second.createdAt.getTime() - first.createdAt.getTime();
    }

    const firstPrice = first.listPriceInArs ?? Number.MAX_SAFE_INTEGER;
    const secondPrice = second.listPriceInArs ?? Number.MAX_SAFE_INTEGER;

    return sort === "cheapest" ? firstPrice - secondPrice : secondPrice - firstPrice;
  };
}

export function arrangeCatalog(
  products: CatalogProduct[],
  filters: CatalogFilters,
): CatalogProduct[] {
  return products
    .filter(
      (product) =>
        matchesCondition(product, filters.condition) &&
        matchesStatus(product, filters.status) &&
        matchesCategory(product, filters.category) &&
        matchesPrice(product, filters),
    )
    .sort(compareByFilters(filters.sort));
}

export function summarizeCategories(products: CatalogProduct[]): CatalogCategory[] {
  const categories = new Map<string, CatalogCategory>();

  for (const product of products) {
    if (product.category === null) {
      continue;
    }

    const existing = categories.get(product.category);

    if (existing === undefined) {
      categories.set(product.category, {
        name: product.category,
        count: 1,
        coverUrl: product.coverUrl,
      });
      continue;
    }

    existing.count += 1;

    if (existing.coverUrl === null) {
      existing.coverUrl = product.coverUrl;
    }
  }

  return Array.from(categories.values()).sort((first, second) => second.count - first.count);
}

export function selectCoverUrl(images: { url: string; kind: string }[]): string | null {
  return images.find((image) => image.kind === "primary")?.url ?? images[0]?.url ?? null;
}
