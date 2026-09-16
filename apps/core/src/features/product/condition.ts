import type { products } from "@tulocal/database/schema/products";

export type ProductCondition = NonNullable<(typeof products.$inferSelect)["condition"]>;

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Nuevo",
  like_new: "Como nuevo",
  good: "Buen estado",
  worn: "Con detalles",
};
