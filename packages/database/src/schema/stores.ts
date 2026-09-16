import { boolean, integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "@tulocal/database/schema/authentication";
import { baseColumns } from "@tulocal/database/schema/columns";

const DEFAULT_MAX_COUNTER_OFFERS = 3;

const DEFAULT_FIRST_CONCESSION_PERCENT = 40;

const DEFAULT_SUBSEQUENT_CONCESSION_PERCENT = 50;

export const agentTone = pgEnum("agent_tone", ["formal", "casual", "terse"]);

export const stores = pgTable(
  "stores",
  {
    ...baseColumns,
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    handle: text("handle").notNull(),
    color: text("color").notNull(),
    whatsappPhone: text("whatsapp_phone"),
    notifyByWhatsapp: boolean("notify_by_whatsapp").default(true).notNull(),
    notifyByEmail: boolean("notify_by_email").default(true).notNull(),
    agentName: text("agent_name").notNull(),
    agentMascot: text("agent_mascot").notNull(),
    agentColor: text("agent_color").notNull(),
    agentTone: agentTone("agent_tone").default("casual").notNull(),
    agentContext: text("agent_context"),
    maxCounterOffers: integer("max_counter_offers").default(DEFAULT_MAX_COUNTER_OFFERS).notNull(),
    firstConcessionPercent: integer("first_concession_percent")
      .default(DEFAULT_FIRST_CONCESSION_PERCENT)
      .notNull(),
    subsequentConcessionPercent: integer("subsequent_concession_percent")
      .default(DEFAULT_SUBSEQUENT_CONCESSION_PERCENT)
      .notNull(),
  },
  (table) => [
    uniqueIndex("stores_owner_id_unique_index").on(table.ownerId),
    uniqueIndex("stores_handle_unique_index").on(table.handle),
  ],
);
