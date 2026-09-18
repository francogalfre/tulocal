import { cn } from "cn";
import type { ReactNode } from "react";

import { tulocalIcons } from "@/components/icons";
import { InView } from "@/components/motion/inview";
import { Rise } from "@/components/motion/rise";
import { Badge } from "@/components/ui/badge";
import { HIGHLIGHTED_PLAN, PLAN_ORDER, PLANS, WIDE_PLAN } from "@/features/plan/catalog";
import { formatArs } from "@/lib/money";
import type { Plan } from "@/features/plan/catalog";

const BADGE_CLASS_NAME = "h-6 bg-brand-deep px-2.5 text-white";

type PlanCardsProps = {
  actions: Record<Plan, ReactNode>;
  currentPlan?: Plan;
};

type PlanBadgeProps = {
  plan: Plan;
  currentPlan: Plan | undefined;
};

type PlanCardProps = {
  plan: Plan;
  currentPlan: Plan | undefined;
  action: ReactNode;
};

function PlanBadge({ plan, currentPlan }: PlanBadgeProps) {
  if (plan === currentPlan) {
    return (
      <Badge className={BADGE_CLASS_NAME}>
        <tulocalIcons.check data-icon="inline-start" />
        Tu plan
      </Badge>
    );
  }

  if (currentPlan === undefined && plan === HIGHLIGHTED_PLAN) {
    return (
      <Badge className={BADGE_CLASS_NAME}>
        <tulocalIcons.star data-icon="inline-start" />
        Recomendado
      </Badge>
    );
  }

  return null;
}

function PlanCard({ plan, currentPlan, action }: PlanCardProps) {
  const details = PLANS[plan];
  const isHighlighted = plan === (currentPlan ?? HIGHLIGHTED_PLAN);
  const isWide = plan === WIDE_PLAN;

  return (
    <Rise
      as="article"
      className={cn(
        "flex flex-col gap-6 rounded-2xl p-6",
        isHighlighted ? "bg-secondary" : "border border-border",
        isWide ? "@3xl:col-span-2 @3xl:grid @3xl:grid-cols-2 @3xl:gap-x-10" : "",
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex h-6 items-center justify-between gap-2">
            <h3 className="font-heading text-lg font-medium">{details.name}</h3>
            <PlanBadge plan={plan} currentPlan={currentPlan} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{details.tagline}</p>
        </div>
        <p className="flex items-baseline gap-1">
          <span className="numeric font-heading text-4xl font-semibold text-brand-deep">
            {formatArs(details.priceInArs)}
          </span>
          <span className="text-sm text-muted-foreground">
            {details.priceInArs === 0 ? "para siempre" : "por mes"}
          </span>
        </p>
      </div>
      <ul
        className={cn(
          "flex flex-1 flex-col gap-2.5",
          isWide ? "@3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1 @3xl:justify-center" : "",
        )}
      >
        {details.benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2 text-sm leading-relaxed">
            <tulocalIcons.check
              className="mt-1 size-4 shrink-0 text-brand-deep"
              aria-hidden="true"
            />
            {benefit}
          </li>
        ))}
      </ul>
      <div
        className={cn(
          "flex flex-col",
          isWide ? "@3xl:col-start-1 @3xl:row-start-2 @3xl:self-end" : "",
        )}
      >
        {action}
      </div>
    </Rise>
  );
}

export function PlanCards({ actions, currentPlan }: PlanCardsProps) {
  return (
    <div className="@container">
      <InView stagger className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
        {PLAN_ORDER.map((plan) => (
          <PlanCard key={plan} plan={plan} currentPlan={currentPlan} action={actions[plan]} />
        ))}
      </InView>
    </div>
  );
}
