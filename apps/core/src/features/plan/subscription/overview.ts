import { desc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { subscriptions } from "@tulocal/database/schema/subscriptions";

import type { SubscriptionStatus } from "@/features/plan/access/resolve";
import type { PaidPlan, Plan } from "@/features/plan/catalog";

export type SubscriptionOverview = {
  latestPaid: {
    plan: PaidPlan;
    status: SubscriptionStatus;
    accessEndsAt: Date | null;
  } | null;
  pendingPreapprovalIds: string[];
};

export async function findSubscriptionOverview(
  storeId: string,
  currentPlan: Plan,
): Promise<SubscriptionOverview> {
  const storeSubscriptions = await database
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      accessEndsAt: subscriptions.accessEndsAt,
      preapprovalId: subscriptions.mercadoPagoPreapprovalId,
    })
    .from(subscriptions)
    .where(eq(subscriptions.storeId, storeId))
    .orderBy(desc(subscriptions.updatedAt));
  const currentPlanSubscriptions = storeSubscriptions.filter(
    (subscription) => subscription.plan === currentPlan && subscription.accessEndsAt !== null,
  );
  const latestPaid =
    currentPlanSubscriptions.find((subscription) => subscription.status === "authorized") ??
    currentPlanSubscriptions.find((subscription) => subscription.status !== "pending");
  const pendingPreapprovalIds = storeSubscriptions.flatMap((subscription) =>
    subscription.status === "pending" && subscription.preapprovalId !== null
      ? [subscription.preapprovalId]
      : [],
  );

  return {
    latestPaid:
      latestPaid === undefined
        ? null
        : {
            plan: latestPaid.plan,
            status: latestPaid.status,
            accessEndsAt: latestPaid.accessEndsAt,
          },
    pendingPreapprovalIds,
  };
}
