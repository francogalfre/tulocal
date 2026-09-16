import { boolean, index, integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { conversations } from "@tulocal/database/schema/conversations";

export const messageRole = pgEnum("message_role", ["buyer", "agent"]);

export const messages = pgTable(
  "messages",
  {
    ...baseColumns,
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: text("content").notNull(),
    photoUrls: text("photo_urls").array().default([]).notNull(),
    offerPriceInArs: integer("offer_price_in_ars"),
    isFinalOffer: boolean("is_final_offer").default(false).notNull(),
  },
  (table) => [index("messages_conversation_id_index").on(table.conversationId)],
);
