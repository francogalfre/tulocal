"use server";

import { and, desc, eq, gte, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { subscriptionPlan, subscriptions } from "@tulocal/database/schema/subscriptions";
import { isPaymentsEnabled } from "@tulocal/payments/client";
import { PreapprovalRejectedError, createPreapproval } from "@tulocal/payments/preapproval";

import { findCurrentPlan } from "@/features/plan/access/current";
import { PLANS } from "@/features/plan/catalog";
import { ensureStore } from "@/features/store/ensure";
import { logEvent } from "@/lib/logger";
import { appOrigin } from "@/lib/origin";
import { requireCurrentSession } from "@/lib/session";
import type { PaidPlan } from "@/features/plan/catalog";

const REUSABLE_CHECKOUT_AGE_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const checkoutSchema = z.object({
  plan: z.enum(subscriptionPlan.enumValues),
  payerEmail: z.email(),
});

export type CheckoutState = {
  error: string | null;
};

type CheckoutRequest = {
  storeId: string;
  plan: PaidPlan;
  payerEmail: string;
};

async function findReusableCheckoutUrl(request: CheckoutRequest): Promise<string | null> {
  const [pending] = await database
    .select({ checkoutUrl: subscriptions.checkoutUrl })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.storeId, request.storeId),
        eq(subscriptions.plan, request.plan),
        eq(subscriptions.payerEmail, request.payerEmail),
        eq(subscriptions.status, "pending"),
        isNotNull(subscriptions.checkoutUrl),
        gte(subscriptions.createdAt, new Date(Date.now() - REUSABLE_CHECKOUT_AGE_IN_MILLISECONDS)),
      ),
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return pending === undefined ? null : pending.checkoutUrl;
}

async function createCheckoutUrl(request: CheckoutRequest): Promise<string | null> {
  const details = PLANS[request.plan];
  const [subscription] = await database
    .insert(subscriptions)
    .values({
      storeId: request.storeId,
      plan: request.plan,
      payerEmail: request.payerEmail,
      amountInArs: details.priceInArs,
    })
    .returning({ id: subscriptions.id });

  if (subscription === undefined) {
    return null;
  }

  const preapproval = await createPreapproval({
    reason: `tulocal ${details.name}`,
    externalReference: subscription.id,
    payerEmail: request.payerEmail,
    amountInArs: details.priceInArs,
    returnUrl: `${appOrigin}/plans`,
  });

  await database
    .update(subscriptions)
    .set({ mercadoPagoPreapprovalId: preapproval.id, checkoutUrl: preapproval.checkoutUrl })
    .where(eq(subscriptions.id, subscription.id));
  logEvent({
    event: "subscription.checkout.created",
    storeId: request.storeId,
    detail: request.plan,
  });

  return preapproval.checkoutUrl;
}

async function openCheckout(request: CheckoutRequest): Promise<string | null> {
  const reusableCheckoutUrl = await findReusableCheckoutUrl(request);

  if (reusableCheckoutUrl !== null) {
    return reusableCheckoutUrl;
  }

  try {
    return await createCheckoutUrl(request);
  } catch (error) {
    if (error instanceof PreapprovalRejectedError) {
      logEvent({
        event: "subscription.checkout.rejected",
        storeId: request.storeId,
        detail: error.message,
      });
      return null;
    }

    throw error;
  }
}

export async function startSubscription(
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await requireCurrentSession();

  if (!isPaymentsEnabled()) {
    return { error: "Los planes pagos todavía no están disponibles." };
  }

  const checkout = checkoutSchema.safeParse({
    plan: formData.get("plan"),
    payerEmail: formData.get("payerEmail"),
  });

  if (!checkout.success) {
    return { error: "Revisá el mail de tu cuenta de Mercado Pago." };
  }

  const store = await ensureStore(session.user);
  const { plan: currentPlan } = await findCurrentPlan(store.id);

  if (currentPlan === checkout.data.plan) {
    return { error: `Ya tenés el plan ${PLANS[currentPlan].name}.` };
  }

  const checkoutUrl = await openCheckout({
    storeId: store.id,
    plan: checkout.data.plan,
    payerEmail: checkout.data.payerEmail.toLowerCase(),
  });

  if (checkoutUrl === null) {
    return {
      error:
        "Mercado Pago no aceptó la suscripción. Fijate que el mail sea el de tu cuenta de Mercado Pago.",
    };
  }

  redirect(checkoutUrl);
}
