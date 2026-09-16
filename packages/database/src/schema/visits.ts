import { index, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export const visitKind = pgEnum("visit_kind", ["store", "product", "whatsapp"]);

export const visits = pgTable(
  "visits",
  {
    ...baseColumns,
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    kind: visitKind("kind").notNull(),
  },
  (table) => [
    index("visits_store_id_index").on(table.storeId),
    index("visits_product_id_index").on(table.productId),
    index("visits_created_at_index").on(table.createdAt),
  ],
);
