import { and, eq, gte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { productCreations } from "@tulocal/database/schema/creations";
import { products } from "@tulocal/database/schema/products";

import { findCurrentPlan } from "@/features/plan/access/current";
import { findArgentineDayStart } from "@/features/plan/limits/period";
import type { PlanDetails } from "@/features/plan/catalog";

const reservedRowsSchema = z.array(z.object({ id: z.uuid() }));

function buildCreationAllowedCondition(storeId: string, details: PlanDetails): SQL {
  const productsTowardsLimit = details.isProductLimitLifetime
    ? database.$count(productCreations, eq(productCreations.storeId, storeId))
    : database.$count(products, eq(products.storeId, storeId));
  const conditions = [sql`${productsTowardsLimit} < ${details.productLimit}`];

  if (details.dailyCreationLimit !== null) {
    const creationsToday = database.$count(
      productCreations,
      and(
        eq(productCreations.storeId, storeId),
        gte(productCreations.createdAt, findArgentineDayStart(new Date())),
      ),
    );

    conditions.push(sql`${creationsToday} < ${details.dailyCreationLimit}`);
  }

  return sql.join(conditions, sql` and `);
}

export async function reserveProductCreation(storeId: string): Promise<string | null> {
  const { details } = await findCurrentPlan(storeId);
  const condition = buildCreationAllowedCondition(storeId, details);
  const [, insertion] = await database.batch([
    database.execute(sql`select pg_advisory_xact_lock(hashtext(${storeId}::text)::bigint)`),
    database.execute(
      sql`insert into ${productCreations} (store_id) select ${storeId}::uuid where ${condition} returning id`,
    ),
  ]);
  const [reservation] = reservedRowsSchema.parse(insertion.rows);

  return reservation === undefined ? null : reservation.id;
}

export async function releaseProductCreation(reservationId: string): Promise<void> {
  await database.delete(productCreations).where(eq(productCreations.id, reservationId));
}
