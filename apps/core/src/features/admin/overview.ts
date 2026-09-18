import { count, sql } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";
import { subscriptions } from "@tulocal/database/schema/subscriptions";

export type AdminOverview = {
  totalStores: number;
  totalProducts: number;
  activeSubscriptions: number;
  monthlyRecurringRevenueInArs: number;
};

export async function summarizeAdminOverview(): Promise<AdminOverview> {
  const [storeRows, productRows, subscriptionRows] = await Promise.all([
    database.select({ total: count() }).from(stores),
    database.select({ total: count() }).from(products),
    database
      .select({
        active: sql<number>`count(*) filter (where ${subscriptions.status} = 'authorized')`.mapWith(
          Number,
        ),
        revenue:
          sql<number>`coalesce(sum(${subscriptions.amountInArs}) filter (where ${subscriptions.status} = 'authorized'), 0)`.mapWith(
            Number,
          ),
      })
      .from(subscriptions),
  ]);

  return {
    totalStores: storeRows[0]?.total ?? 0,
    totalProducts: productRows[0]?.total ?? 0,
    activeSubscriptions: subscriptionRows[0]?.active ?? 0,
    monthlyRecurringRevenueInArs: subscriptionRows[0]?.revenue ?? 0,
  };
}
