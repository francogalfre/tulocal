import { z } from "zod";

import type { products } from "@tulocal/database/schema/products";

export type CatalogProduct = {
  id: string;
  title: string | null;
  listPriceInArs: number | null;
  condition: "new" | "used" | null;
  status: typeof products.$inferSelect.status;
  coverUrl: string | null;
  createdAt: Date;
};

const catalogFiltersSchema = z.object({
  condition: z.enum(["all", "new", "used"]).catch("all"),
  status: z.enum(["all", "published", "review", "sold"]).catch("all"),
  sort: z.enum(["newest", "cheapest", "priciest"]).catch("newest"),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

export type RawCatalogFilters = {
  condition?: string | string[];
  status?: string | string[];
  sort?: string | string[];
};

const REVIEW_STATUSES = new Set(["processing", "review", "failed"]);

export function parseCatalogFilters(raw: RawCatalogFilters): CatalogFilters {
  return catalogFiltersSchema.parse(raw);
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
        matchesCondition(product, filters.condition) && matchesStatus(product, filters.status),
    )
    .sort(compareByFilters(filters.sort));
}

export function selectCoverUrl(images: { url: string; kind: string }[]): string | null {
  return images.find((image) => image.kind === "primary")?.url ?? images[0]?.url ?? null;
}
