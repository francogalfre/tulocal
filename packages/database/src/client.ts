import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { databaseEnvironment } from "@tulocal/environment/database";

import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "@tulocal/database/schema/authentication";
import { comparables } from "@tulocal/database/schema/comparables";
import { conversations } from "@tulocal/database/schema/conversations";
import { escalations } from "@tulocal/database/schema/escalations";
import { images } from "@tulocal/database/schema/images";
import { messages } from "@tulocal/database/schema/messages";
import { products } from "@tulocal/database/schema/products";
import { questions } from "@tulocal/database/schema/questions";
import {
  comparablesRelations,
  conversationsRelations,
  escalationsRelations,
  imagesRelations,
  messagesRelations,
  productsRelations,
  questionsRelations,
  storesRelations,
  usersRelations,
  visitsRelations,
} from "@tulocal/database/schema/relations";
import { stores } from "@tulocal/database/schema/stores";
import { visits } from "@tulocal/database/schema/visits";

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
};

export const database = drizzle(neon(databaseEnvironment.DATABASE_URL), { schema });

export type Database = typeof database;
