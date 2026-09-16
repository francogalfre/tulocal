import { pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { products } from "@tulocal/database/schema/products";

export const sceneFormat = pgEnum("scene_format", ["story", "carousel"]);

export const sceneStatus = pgEnum("scene_status", ["pending", "ready", "failed"]);

export const scenes = pgTable(
  "scenes",
  {
    ...baseColumns,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    format: sceneFormat("format").notNull(),
    status: sceneStatus("status").default("pending").notNull(),
    url: text("url"),
    error: text("error"),
  },
  (table) => [uniqueIndex("scenes_product_id_format_index").on(table.productId, table.format)],
);
