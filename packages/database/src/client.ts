import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { databaseEnvironment } from "@tulocal/environment/database";

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

import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "@tulocal/database/schema/authentication";

import {
  comparablesRelations,
  conversationsRelations,
  escalationsRelations,
  imagesRelations,
  messagesRelations,
  productCreationsRelations,
  productsRelations,
  questionsRelations,
  scenesRelations,
  storesRelations,
  subscriptionsRelations,
  usersRelations,
  visitsRelations,
} from "@tulocal/database/schema/relations";

const schema = {
  users,
  sessions,
  accounts,
  verifications,
  rateLimits,
  stores,
  products,
  images,
  comparables,
  conversations,
  messages,
  questions,
  escalations,
  visits,
  scenes,
  subscriptions,
  productCreations,
  usersRelations,
  storesRelations,
  productsRelations,
  imagesRelations,
  comparablesRelations,
  conversationsRelations,
  messagesRelations,
  questionsRelations,
  escalationsRelations,
  visitsRelations,
  scenesRelations,
  subscriptionsRelations,
  productCreationsRelations,
};

export const database = drizzle(neon(databaseEnvironment.DATABASE_URL), { schema });

export type Database = typeof database;
