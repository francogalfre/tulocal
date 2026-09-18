import Link from "next/link";
import type { Metadata } from "next";

import { tulocalIcons } from "@/components/icons";
import { Reveal } from "@/components/motion/reveal";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { findCurrentPlan } from "@/features/plan/access/current";
import { PLANS } from "@/features/plan/catalog";
import { Meter } from "@/features/plan/limits/meter";
import { findProductCreationBlocker, findProductUsage } from "@/features/plan/limits/usage";
import { Dropzone } from "@/features/product/upload/dropzone";
import { ensureStore } from "@/features/store/ensure";
import { findStoreEntry } from "@/features/store/find";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";
import type { Plan } from "@/features/plan/catalog";
import type { ProductCreationBlocker } from "@/features/plan/limits/usage";

export const metadata: Metadata = {
  title: "Subí un producto",
  robots: { index: false },
};

type IntroProps = {
  handle: string;
  isFirstProduct: boolean;
};

function Intro({ handle, isFirstProduct }: IntroProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl">¿Qué vendés?</h1>
      {isFirstProduct ? (
        <p className="text-muted-foreground">
          Tu tienda ya está en{" "}
          <a
            href={buildStoreUrl(handle)}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-0.5 rounded-sm font-medium text-brand-deep underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            tulocal/{handle}
            <tulocalIcons.arrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
          . Sacale fotos a algo que quieras vender y la publicación se arma sola.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Sacale fotos y la publicación se arma sola: título, precio y fotos mejoradas.
        </p>
      )}
    </div>
  );
}

type PlanLimitReachedProps = {
  currentPlan: Plan;
  blocker: ProductCreationBlocker;
};

function describeUpgrade(currentPlan: Plan, blocker: ProductCreationBlocker): string {
  if (blocker === "monthly-limit" && currentPlan === "pro") {
    return `El cupo se renueva el 1. Con ${PLANS.business.name} publicás hasta ${PLANS.business.monthlyCreationLimit} productos nuevos por mes.`;
  }

  if (blocker === "monthly-limit") {
    return "El cupo de productos nuevos se renueva el 1 de cada mes.";
  }

  if (currentPlan === "free") {
    return `Con ${PLANS.pro.name} tenés hasta ${PLANS.pro.productLimit} productos a la vez y tu agente atiende sin límite de mensajes.`;
  }

  if (currentPlan === "pro") {
    return `Con ${PLANS.business.name} tenés hasta ${PLANS.business.productLimit} productos a la vez. También podés borrar uno que ya vendiste para liberar lugar.`;
  }

  return "Borrá uno que ya vendiste para liberar lugar.";
}

function PlanLimitReached({ currentPlan, blocker }: PlanLimitReachedProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-secondary p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">
          {blocker === "monthly-limit"
            ? "Llegaste a los productos nuevos de este mes"
            : "Llegaste al límite de tu plan"}
        </h2>
        <p className="text-muted-foreground">{describeUpgrade(currentPlan, blocker)}</p>
      </div>
      <Button size="xl" render={<Link href="/plans" />} nativeButton={false}>
        Ver planes
      </Button>
    </div>
  );
}

export default async function NewProductPage() {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);
  const entry = await findStoreEntry(session.user.id);
  const isFirstProduct = entry === null || !entry.hasProducts;
  const [{ plan: currentPlan }, usage, blocker] = await Promise.all([
    findCurrentPlan(store.id),
    findProductUsage(store.id),
    findProductCreationBlocker(store.id),
  ]);

  return (
    <Screen aside={<StoreLink handle={store.handle} />}>
      <Reveal className="flex flex-col gap-8">
        <Intro handle={store.handle} isFirstProduct={isFirstProduct} />
        <Meter usage={usage} showsPlansLink={blocker === null} />
        {blocker !== null ? (
          <PlanLimitReached currentPlan={currentPlan} blocker={blocker} />
        ) : (
          <Dropzone />
        )}
      </Reveal>
    </Screen>
  );
}
