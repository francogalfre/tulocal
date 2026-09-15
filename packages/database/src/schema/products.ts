import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { stores } from "@tulocal/database/schema/stores";

export const productCondition = pgEnum("product_condition", ["new", "used"]);

export const productStatus = pgEnum("product_status", [
  "processing",
  "review",
  "published",
  "failed",
  "sold",
]);

export const pipelineStage = pgEnum("pipeline_stage", [
  "identifying",
  "imaging",
  "writing",
  "researching",
  "completed",
]);

export const products = pgTable(
  "products",
  {
    ...baseColumns,
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text("title"),
    description: text("description"),
    condition: productCondition("condition"),
    conditionNotes: text("condition_notes"),
    attributes: text("attributes").array().default([]).notNull(),
    sellerNotes: text("seller_notes"),
    listPriceInArs: integer("list_price_in_ars"),
    floorPriceInArs: integer("floor_price_in_ars"),
    suggestedMinimumPriceInArs: integer("suggested_minimum_price_in_ars"),
    suggestedMaximumPriceInArs: integer("suggested_maximum_price_in_ars"),
    status: productStatus("status").default("processing").notNull(),
    pipelineStage: pipelineStage("pipeline_stage").default("identifying").notNull(),
    pipelineError: text("pipeline_error"),
    publishedAt: timestamp("published_at"),
    soldAt: timestamp("sold_at"),
  },
  (table) => [index("products_store_id_index").on(table.storeId)],
);
