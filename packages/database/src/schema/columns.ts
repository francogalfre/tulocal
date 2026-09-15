import { timestamp, uuid } from "drizzle-orm/pg-core";

function currentTimestamp(): Date {
  return new Date();
}

export const baseColumns = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(currentTimestamp).notNull(),
};
