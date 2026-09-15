import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { conversations } from "@tulocal/database/schema/conversations";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export const escalationKind = pgEnum("escalation_kind", ["buy_intent", "scam_suspected"]);

export const escalations = pgTable(
  "escalations",
  {
    ...baseColumns,
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    kind: escalationKind("kind").notNull(),
    summary: text("summary").notNull(),
    agreedPriceInArs: integer("agreed_price_in_ars"),
    seenAt: timestamp("seen_at"),
  },
  (table) => [
    index("escalations_conversation_id_index").on(table.conversationId),
    index("escalations_store_id_index").on(table.storeId),
  ],
);
