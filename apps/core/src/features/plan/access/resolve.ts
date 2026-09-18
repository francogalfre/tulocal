import type { subscriptionStatus } from "@tulocal/database/schema/subscriptions";

import { PLAN_ORDER } from "@/features/plan/catalog";
import type { PaidPlan, Plan } from "@/features/plan/catalog";

const ACCESS_GRACE_PERIOD_IN_MILLISECONDS = 3 * 24 * 60 * 60 * 1000;

export type SubscriptionStatus = (typeof subscriptionStatus.enumValues)[number];

export type SubscriptionAccess = {
  plan: PaidPlan;
  status: SubscriptionStatus;
  accessEndsAt: Date | null;
};

function isGrantingAccess(subscription: SubscriptionAccess, now: Date): boolean {
  if (subscription.status === "authorized") {
    return true;
  }

  if (subscription.accessEndsAt === null) {
    return false;
  }

  return subscription.accessEndsAt.getTime() + ACCESS_GRACE_PERIOD_IN_MILLISECONDS > now.getTime();
}

export function resolvePlan(subscriptions: SubscriptionAccess[], now: Date): Plan {
  let resolvedPlan: Plan = "free";

  for (const subscription of subscriptions) {
    const isHigherPlan = PLAN_ORDER.indexOf(subscription.plan) > PLAN_ORDER.indexOf(resolvedPlan);

    if (isHigherPlan && isGrantingAccess(subscription, now)) {
      resolvedPlan = subscription.plan;
    }
  }

  return resolvedPlan;
}
