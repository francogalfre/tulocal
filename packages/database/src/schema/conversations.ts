import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export const conversationStatus = pgEnum("conversation_status", ["open", "closed"]);

export const conversations = pgTable(
  "conversations",
  {
    ...baseColumns,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    buyerToken: text("buyer_token").notNull(),
    status: conversationStatus("status").default("open").notNull(),
    counterOfferCount: integer("counter_offer_count").default(0).notNull(),
    lastCounterOfferInArs: integer("last_counter_offer_in_ars"),
    lastBuyerOfferInArs: integer("last_buyer_offer_in_ars"),
    agreedPriceInArs: integer("agreed_price_in_ars"),
    lastMessageAt: timestamp("last_message_at"),
  },
  (table) => [
    uniqueIndex("conversations_product_id_buyer_token_unique_index").on(
      table.productId,
      table.buyerToken,
    ),
    index("conversations_store_id_index").on(table.storeId),
  ],
);
