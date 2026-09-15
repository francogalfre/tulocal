import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const productStatus = pgEnum("product_status", ["processing", "ready", "failed"]);
export const productCondition = pgEnum("product_condition", ["new", "used"]);
export const imageKind = pgEnum("image_kind", [
  "original",
  "studio",
  "lifestyle",
  "enhanced",
  "hero",
]);
export const conversationStatus = pgEnum("conversation_status", ["open", "deal", "closed"]);
export const messageRole = pgEnum("message_role", ["user", "assistant", "system"]);

export type StepState = "pending" | "running" | "done" | "failed";
export type PipelineSteps = { analyze: StepState; images: StepState; prices: StepState };
export type MarketSource = { title: string; url: string; price: number | null };

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at").defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull();

export const store = pgTable(
  "store",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    whatsappPhone: text("whatsapp_phone").notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("store_owner_uidx").on(t.ownerId), uniqueIndex("store_slug_uidx").on(t.slug)],
);

export const product = pgTable(
  "product",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    title: text("title"),
    description: text("description"),
    category: text("category"),
    brand: text("brand"),
    model: text("model"),
    condition: productCondition("condition").default("used").notNull(),
    qualityPercent: integer("quality_percent"),
    conditionNotes: jsonb("condition_notes").$type<string[]>().default([]).notNull(),
    attributes: jsonb("attributes").$type<Record<string, string>>().default({}).notNull(),
    hint: text("hint"),
    searchQuery: text("search_query"),
    listPrice: integer("list_price"),
    minPrice: integer("min_price"),
    marketMinPrice: integer("market_min_price"),
    marketMaxPrice: integer("market_max_price"),
    marketSummary: text("market_summary"),
    marketSources: jsonb("market_sources").$type<MarketSource[]>().default([]).notNull(),
    status: productStatus("status").default("processing").notNull(),
    pipelineStage: text("pipeline_stage").default("uploading").notNull(),
    pipelineSteps: jsonb("pipeline_steps")
      .$type<PipelineSteps>()
      .default({ analyze: "pending", images: "pending", prices: "pending" })
      .notNull(),
    pipelineError: text("pipeline_error"),
    published: boolean("published").default(false).notNull(),
    coverImageId: text("cover_image_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("product_store_idx").on(t.storeId)],
);

export const productImage = pgTable(
  "product_image",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    kind: imageKind("kind").notNull(),
    fidelityPassed: boolean("fidelity_passed"),
    fidelityIssues: jsonb("fidelity_issues").$type<string[]>().default([]).notNull(),
    visible: boolean("visible").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("product_image_product_idx").on(t.productId)],
);

export const conversation = pgTable(
  "conversation",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id").notNull(),
    status: conversationStatus("status").default("open").notNull(),
    round: integer("round").default(0).notNull(),
    currentAsk: integer("current_ask"),
    lastOffer: integer("last_offer"),
    agreedPrice: integer("agreed_price"),
    dealSummary: text("deal_summary"),
    whatsappUrl: text("whatsapp_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("conversation_product_visitor_uidx").on(t.productId, t.visitorId),
    index("conversation_store_idx").on(t.storeId),
  ],
);

export const message = pgTable(
  "message",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    parts: jsonb("parts").$type<unknown[]>().default([]).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("message_conversation_idx").on(t.conversationId)],
);

export const storeRelations = relations(store, ({ one, many }) => ({
  owner: one(user, { fields: [store.ownerId], references: [user.id] }),
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  store: one(store, { fields: [product.storeId], references: [store.id] }),
  images: many(productImage),
  conversations: many(conversation),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, { fields: [productImage.productId], references: [product.id] }),
}));

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  product: one(product, { fields: [conversation.productId], references: [product.id] }),
  store: one(store, { fields: [conversation.storeId], references: [store.id] }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

export type Store = typeof store.$inferSelect;
export type Product = typeof product.$inferSelect;
export type ProductImage = typeof productImage.$inferSelect;
export type Conversation = typeof conversation.$inferSelect;
export type Message = typeof message.$inferSelect;
