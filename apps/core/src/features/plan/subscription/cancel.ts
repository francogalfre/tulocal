"use server";

import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { database } from "@tulocal/database/client";
import { subscriptions } from "@tulocal/database/schema/subscriptions";
import { isPaymentsEnabled } from "@tulocal/payments/client";
import { cancelPreapproval } from "@tulocal/payments/preapproval";

import { syncPreapproval } from "@/features/plan/subscription/sync";
import { findStoreByOwner } from "@/features/store/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

export async function cancelSubscription(): Promise<void> {
  const session = await requireCurrentSession();
  const store = await findStoreByOwner(session.user.id);

  if (store === null || !isPaymentsEnabled()) {
    return;
  }

  const active = await database
    .select({ preapprovalId: subscriptions.mercadoPagoPreapprovalId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.storeId, store.id),
        inArray(subscriptions.status, ["authorized", "paused"]),
        isNotNull(subscriptions.mercadoPagoPreapprovalId),
      ),
    );

  for (const subscription of active) {
    if (subscription.preapprovalId !== null) {
      await cancelPreapproval(subscription.preapprovalId);
      await syncPreapproval(subscription.preapprovalId);
    }
  }

  logEvent({ event: "subscription.cancelled", storeId: store.id });
  revalidatePath("/plans");
}
