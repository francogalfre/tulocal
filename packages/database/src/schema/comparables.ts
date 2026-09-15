import { index, integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { products } from "@tulocal/database/schema/products";

export const comparableSource = pgEnum("comparable_source", ["mercadolibre", "facebook", "other"]);

export const comparables = pgTable(
  "comparables",
  {
    ...baseColumns,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    priceInArs: integer("price_in_ars").notNull(),
    source: comparableSource("source").notNull(),
  },
  (table) => [index("comparables_product_id_index").on(table.productId)],
);
