import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PLANS } from "@/features/plan/catalog";
import type { Plan } from "@/features/plan/catalog";

type PlanSectionProps = {
  currentPlan: Plan;
};

function describePlan(currentPlan: Plan): string {
  if (currentPlan === "free") {
    return `Con ${PLANS.pro.name} tenés ${PLANS.pro.productLimit} productos a la vez, agente sin límite y tu tienda aparece primero.`;
  }

  return "Desde tus planes podés cambiar de plan o cancelarlo cuando quieras.";
}

export function PlanSection({ currentPlan }: PlanSectionProps) {
  const isFree = currentPlan === "free";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">Plan {PLANS[currentPlan].name}</h2>
        <p className="text-muted-foreground">{describePlan(currentPlan)}</p>
      </div>
      <Button
        size="xl"
        variant={isFree ? "default" : "outline"}
        render={<Link href="/plans" />}
        nativeButton={false}
      >
        {isFree ? "Mejorar mi plan" : "Cambiar o cancelar plan"}
      </Button>
    </section>
  );
}
