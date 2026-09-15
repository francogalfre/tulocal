import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { conversations } from "@tulocal/database/schema/conversations";
import { products } from "@tulocal/database/schema/products";

export const questionStatus = pgEnum("question_status", ["pending", "answered"]);

export const questions = pgTable(
  "questions",
  {
    ...baseColumns,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    question: text("question").notNull(),
    answer: text("answer"),
    status: questionStatus("status").default("pending").notNull(),
    answeredAt: timestamp("answered_at"),
  },
  (table) => [index("questions_product_id_index").on(table.productId)],
);
