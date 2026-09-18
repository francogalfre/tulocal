import { relations } from "drizzle-orm";

import { users } from "@tulocal/database/schema/authentication";
import { comparables } from "@tulocal/database/schema/comparables";
import { conversations } from "@tulocal/database/schema/conversations";
import { productCreations } from "@tulocal/database/schema/creations";
import { escalations } from "@tulocal/database/schema/escalations";
import { images } from "@tulocal/database/schema/images";
import { messages } from "@tulocal/database/schema/messages";
import { products } from "@tulocal/database/schema/products";
import { questions } from "@tulocal/database/schema/questions";
import { scenes } from "@tulocal/database/schema/scenes";
import { stores } from "@tulocal/database/schema/stores";
import { subscriptions } from "@tulocal/database/schema/subscriptions";
import { visits } from "@tulocal/database/schema/visits";

export const usersRelations = relations(users, ({ one }) => ({
  store: one(stores),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  products: many(products),
  conversations: many(conversations),
  escalations: many(escalations),
  visits: many(visits),
  subscriptions: many(subscriptions),
  productCreations: many(productCreations),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  images: many(images),
  comparables: many(comparables),
  questions: many(questions),
  conversations: many(conversations),
  escalations: many(escalations),
  visits: many(visits),
  scenes: many(scenes),
}));

export const scenesRelations = relations(scenes, ({ one }) => ({
  product: one(products, { fields: [scenes.productId], references: [products.id] }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  store: one(stores, { fields: [visits.storeId], references: [stores.id] }),
  product: one(products, { fields: [visits.productId], references: [products.id] }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  product: one(products, { fields: [images.productId], references: [products.id] }),
}));

export const comparablesRelations = relations(comparables, ({ one }) => ({
  product: one(products, { fields: [comparables.productId], references: [products.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  product: one(products, { fields: [conversations.productId], references: [products.id] }),
  store: one(stores, { fields: [conversations.storeId], references: [stores.id] }),
  messages: many(messages),
  questions: many(questions),
  escalations: many(escalations),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  product: one(products, { fields: [questions.productId], references: [products.id] }),
  conversation: one(conversations, {
    fields: [questions.conversationId],
    references: [conversations.id],
  }),
}));

export const escalationsRelations = relations(escalations, ({ one }) => ({
  conversation: one(conversations, {
    fields: [escalations.conversationId],
    references: [conversations.id],
  }),
  product: one(products, { fields: [escalations.productId], references: [products.id] }),
  store: one(stores, { fields: [escalations.storeId], references: [stores.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  store: one(stores, { fields: [subscriptions.storeId], references: [stores.id] }),
}));

export const productCreationsRelations = relations(productCreations, ({ one }) => ({
  store: one(stores, { fields: [productCreations.storeId], references: [stores.id] }),
}));
