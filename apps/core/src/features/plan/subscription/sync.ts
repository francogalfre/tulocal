import { and, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { subscriptions } from "@tulocal/database/schema/subscriptions";
import { cancelPreapproval, findPreapproval } from "@tulocal/payments/preapproval";

import { logEvent } from "@/lib/logger";

const subscriptionIdSchema = z.uuid();

async function cancelReplacedSubscriptions(
  storeId: string,
  keptSubscriptionId: string,
): Promise<void> {
  const replaced = await database
    .select({ id: subscriptions.id, preapprovalId: subscriptions.mercadoPagoPreapprovalId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.storeId, storeId),
        ne(subscriptions.id, keptSubscriptionId),
        inArray(subscriptions.status, ["pending", "authorized", "paused"]),
        isNotNull(subscriptions.mercadoPagoPreapprovalId),
      ),
    );

  for (const subscription of replaced) {
    if (subscription.preapprovalId !== null) {
      await cancelPreapproval(subscription.preapprovalId);
      await database
        .update(subscriptions)
        .set({ status: "cancelled" })
        .where(eq(subscriptions.id, subscription.id));
      logEvent({ event: "subscription.replaced", storeId, detail: subscription.id });
    }
  }
}

export async function syncPreapproval(preapprovalId: string): Promise<void> {
  const preapproval = await findPreapproval(preapprovalId);
  const subscriptionId = subscriptionIdSchema.safeParse(preapproval.externalReference);

  if (!subscriptionId.success) {
    logEvent({ event: "subscription.sync.foreign", detail: preapproval.id });
    return;
  }

  const subscription = await database.query.subscriptions.findFirst({
    where: eq(subscriptions.id, subscriptionId.data),
  });

  if (subscription === undefined) {
    logEvent({ event: "subscription.sync.unknown", detail: preapproval.id });
    return;
  }

  const isLinkedToAnotherPreapproval =
    subscription.mercadoPagoPreapprovalId !== null &&
    subscription.mercadoPagoPreapprovalId !== preapproval.id;

  if (isLinkedToAnotherPreapproval) {
    logEvent({ event: "subscription.sync.mismatch", detail: preapproval.id });
    return;
  }

  const isAuthorized = preapproval.status === "authorized";

  await database
    .update(subscriptions)
    .set({
      status: preapproval.status,
      mercadoPagoPreapprovalId: preapproval.id,
      accessEndsAt:
        isAuthorized && preapproval.nextPaymentAt !== null
          ? preapproval.nextPaymentAt
          : subscription.accessEndsAt,
    })
    .where(eq(subscriptions.id, subscription.id));
  logEvent({
    event: "subscription.synced",
    storeId: subscription.storeId,
    detail: `${subscription.plan}:${preapproval.status}`,
  });

  if (isAuthorized) {
    await cancelReplacedSubscriptions(subscription.storeId, subscription.id);
  }
}
