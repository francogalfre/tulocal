import { after } from "next/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { z } from "zod";

import { isPaymentsEnabled } from "@tulocal/payments/client";

import { Reveal } from "@/components/motion/reveal";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { findCurrentPlan } from "@/features/plan/access/current";
import { PlanCards } from "@/features/plan/cards";
import { HIGHLIGHTED_PLAN, PLANS } from "@/features/plan/catalog";
import { Meter } from "@/features/plan/limits/meter";
import { MonthlyUsage } from "@/features/plan/limits/monthly";
import { findSceneUsage } from "@/features/plan/limits/scenes";
import { findMonthlyCreationUsage, findProductUsage } from "@/features/plan/limits/usage";
import { Confirming } from "@/features/plan/subscription/confirming";
import { findSubscriptionOverview } from "@/features/plan/subscription/overview";
import { Subscribe } from "@/features/plan/subscription/subscribe";
import { syncPreapproval } from "@/features/plan/subscription/sync";
import { Unsubscribe } from "@/features/plan/subscription/unsubscribe";
import { ensureStore } from "@/features/store/ensure";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";
import { formatDate } from "@/lib/time";
import type { PaidPlan, Plan } from "@/features/plan/catalog";
import type { SubscriptionOverview } from "@/features/plan/subscription/overview";

const returnedPreapprovalIdSchema = z.string().min(1);

export const metadata: Metadata = {
  title: "Planes",
  robots: { index: false },
};

type PlansPageProps = PageProps<"/plans">;

type BuildActionsInput = {
  currentPlan: Plan;
  overview: SubscriptionOverview;
  suggestedEmail: string;
  arePaymentsEnabled: boolean;
};

function describeCurrentPlan(currentPlan: Plan, overview: SubscriptionOverview): string {
  const { latestPaid } = overview;

  if (currentPlan === "free" || latestPaid === null || latestPaid.accessEndsAt === null) {
    return "Estás en el plan Gratis.";
  }

  const planName = PLANS[latestPaid.plan].name;
  const accessEndsOn = formatDate(latestPaid.accessEndsAt);

  if (latestPaid.status === "authorized") {
    return `Estás en ${planName}. Se renueva el ${accessEndsOn}.`;
  }

  return `Cancelaste ${planName}. Lo seguís usando hasta el ${accessEndsOn}.`;
}

function buildPaidAction(plan: PaidPlan, input: BuildActionsInput): ReactNode {
  const details = PLANS[plan];
  const isActiveSubscription =
    input.currentPlan === plan && input.overview.latestPaid?.status === "authorized";

  if (isActiveSubscription) {
    return <Unsubscribe planName={details.name} />;
  }

  if (input.currentPlan === plan) {
    return null;
  }

  if (!input.arePaymentsEnabled) {
    return (
      <Button size="xl" variant={plan === HIGHLIGHTED_PLAN ? "default" : "outline"} disabled>
        Muy pronto
      </Button>
    );
  }

  return (
    <Subscribe
      plan={plan}
      planName={details.name}
      priceInArs={details.priceInArs}
      suggestedEmail={input.suggestedEmail}
      isHighlighted={plan === HIGHLIGHTED_PLAN}
    />
  );
}

function buildActions(input: BuildActionsInput): Record<Plan, ReactNode> {
  return {
    free:
      input.currentPlan === "free" ? null : (
        <p className="text-sm text-muted-foreground">
          Si cancelás tu plan, volvés a Gratis y tus productos quedan publicados.
        </p>
      ),
    pro: buildPaidAction("pro", input),
    business: buildPaidAction("business", input),
  };
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);
  const { plan: currentPlan } = await findCurrentPlan(store.id);
  const [usage, creationUsage, sceneUsage, overview] = await Promise.all([
    findProductUsage(store.id),
    findMonthlyCreationUsage(store.id),
    findSceneUsage(store.id),
    findSubscriptionOverview(store.id, currentPlan),
  ]);
  const arePaymentsEnabled = isPaymentsEnabled();
  const returnedPreapprovalId = returnedPreapprovalIdSchema.safeParse(
    (await searchParams).preapproval_id,
  );
  const isConfirmingPayment =
    arePaymentsEnabled &&
    returnedPreapprovalId.success &&
    overview.pendingPreapprovalIds.includes(returnedPreapprovalId.data);

  if (isConfirmingPayment) {
    after(() => syncPreapproval(returnedPreapprovalId.data));
  }

  return (
    <Screen aside={<StoreLink handle={store.handle} />}>
      <Reveal className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Tu plan</h1>
          <p className="text-muted-foreground">{describeCurrentPlan(currentPlan, overview)}</p>
        </div>
        <Meter usage={usage} showsPlansLink={false} />
        <MonthlyUsage creationUsage={creationUsage} sceneUsage={sceneUsage} />
        {isConfirmingPayment ? <Confirming /> : null}
        <PlanCards
          currentPlan={currentPlan}
          actions={buildActions({
            currentPlan,
            overview,
            suggestedEmail: session.user.email,
            arePaymentsEnabled,
          })}
        />
      </Reveal>
    </Screen>
  );
}
