import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { stores } from "@tulocal/database/schema/stores";

export const productCreations = pgTable(
  "product_creations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_creations_store_id_created_at_index").on(table.storeId, table.createdAt),
  ],
);
