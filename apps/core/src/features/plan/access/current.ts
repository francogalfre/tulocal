import { and, eq, ne } from "drizzle-orm";
import { cache } from "react";

import { database } from "@tulocal/database/client";
import { subscriptions } from "@tulocal/database/schema/subscriptions";

import { resolvePlan } from "@/features/plan/access/resolve";
import { PLANS } from "@/features/plan/catalog";
import type { Plan, PlanDetails } from "@/features/plan/catalog";

export type CurrentPlan = {
  plan: Plan;
  details: PlanDetails;
};

async function findCurrentPlanOnce(storeId: string): Promise<CurrentPlan> {
  const storeSubscriptions = await database
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      accessEndsAt: subscriptions.accessEndsAt,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.storeId, storeId), ne(subscriptions.status, "pending")));
  const plan = resolvePlan(storeSubscriptions, new Date());

  return { plan, details: PLANS[plan] };
}

export const findCurrentPlan = cache(findCurrentPlanOnce);
