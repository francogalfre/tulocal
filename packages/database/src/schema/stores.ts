import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "@tulocal/database/schema/authentication";
import { baseColumns } from "@tulocal/database/schema/columns";

const DEFAULT_MAX_COUNTER_OFFERS = 3;

const DEFAULT_FIRST_CONCESSION_PERCENT = 40;

const DEFAULT_SUBSEQUENT_CONCESSION_PERCENT = 50;

export const agentVoice = pgEnum("agent_voice", ["cordial", "playful", "direct"]);

export const stores = pgTable(
  "stores",
  {
    ...baseColumns,
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    handle: text("handle").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    color: text("color").notNull(),
    whatsappPhone: text("whatsapp_phone"),
    instagramHandle: text("instagram_handle"),
    tiktokHandle: text("tiktok_handle"),
    facebookHandle: text("facebook_handle"),
    xHandle: text("x_handle"),
    addressLine: text("address_line"),
    addressLatitude: doublePrecision("address_latitude"),
    addressLongitude: doublePrecision("address_longitude"),
    locationName: text("location_name"),
    locationLatitude: doublePrecision("location_latitude"),
    locationLongitude: doublePrecision("location_longitude"),
    notifyByWhatsapp: boolean("notify_by_whatsapp").default(true).notNull(),
    notifyByEmail: boolean("notify_by_email").default(true).notNull(),
    agentName: text("agent_name").notNull(),
    agentSeed: text("agent_seed")
      .default(sql`gen_random_uuid()`)
      .notNull(),
    agentVoice: agentVoice("agent_voice").default("cordial").notNull(),
    agentOpensNegotiation: boolean("agent_opens_negotiation").default(false).notNull(),
    agentContext: text("agent_context"),
    maxCounterOffers: integer("max_counter_offers").default(DEFAULT_MAX_COUNTER_OFFERS).notNull(),
    firstConcessionPercent: integer("first_concession_percent")
      .default(DEFAULT_FIRST_CONCESSION_PERCENT)
      .notNull(),
    subsequentConcessionPercent: integer("subsequent_concession_percent")
      .default(DEFAULT_SUBSEQUENT_CONCESSION_PERCENT)
      .notNull(),
    suspendedAt: timestamp("suspended_at"),
  },
  (table) => [
    uniqueIndex("stores_owner_id_unique_index").on(table.ownerId),
    uniqueIndex("stores_handle_unique_index").on(table.handle),
  ],
);
