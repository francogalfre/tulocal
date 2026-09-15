import { index, integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { products } from "@tulocal/database/schema/products";

export const imageKind = pgEnum("image_kind", ["original", "primary", "contextual"]);

export const images = pgTable(
  "images",
  {
    ...baseColumns,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    kind: imageKind("kind").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("images_product_id_index").on(table.productId)],
);
