import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseColumns } from "@tulocal/database/schema/columns";
import { stores } from "@tulocal/database/schema/stores";

export const subscriptionPlan = pgEnum("subscription_plan", ["pro", "business"]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "pending",
  "authorized",
  "paused",
  "cancelled",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    ...baseColumns,
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    plan: subscriptionPlan("plan").notNull(),
    status: subscriptionStatus("status").default("pending").notNull(),
    mercadoPagoPreapprovalId: text("mercado_pago_preapproval_id").unique(),
    checkoutUrl: text("checkout_url"),
    payerEmail: text("payer_email").notNull(),
    amountInArs: integer("amount_in_ars").notNull(),
    accessEndsAt: timestamp("access_ends_at"),
  },
  (table) => [index("subscriptions_store_id_index").on(table.storeId)],
);
