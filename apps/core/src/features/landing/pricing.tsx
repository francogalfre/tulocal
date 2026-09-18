import Link from "next/link";
import type { ReactNode } from "react";

import { isPaymentsEnabled } from "@tulocal/payments/client";

import { InView } from "@/components/motion/inview";
import { Button } from "@/components/ui/button";
import { GoogleSignIn } from "@/features/landing/google";
import { PlanCards } from "@/features/plan/cards";
import type { Plan } from "@/features/plan/catalog";

const PLANS_PATH = "/plans";

type PricingProps = {
  signedInStorePath: string | null;
};

function buildComingSoonActions(freeAction: ReactNode): Record<Plan, ReactNode> {
  return {
    free: freeAction,
    pro: (
      <Button size="xl" disabled>
        Muy pronto
      </Button>
    ),
    business: (
      <Button size="xl" variant="outline" disabled>
        Muy pronto
      </Button>
    ),
  };
}

function buildSignedInActions(signedInStorePath: string): Record<Plan, ReactNode> {
  return {
    free: (
      <Button
        size="xl"
        variant="outline"
        render={<Link href={signedInStorePath} />}
        nativeButton={false}
      >
        Ir a mi local
      </Button>
    ),
    pro: (
      <Button size="xl" render={<Link href={PLANS_PATH} />} nativeButton={false}>
        Pasarme a Pro
      </Button>
    ),
    business: (
      <Button size="xl" variant="outline" render={<Link href={PLANS_PATH} />} nativeButton={false}>
        Pasarme a Negocio
      </Button>
    ),
  };
}

function buildSignedOutActions(): Record<Plan, ReactNode> {
  return {
    free: <GoogleSignIn label="Empezar gratis" variant="outline" size="xl" />,
    pro: (
      <GoogleSignIn
        label="Empezar con Pro"
        afterSignInPath={PLANS_PATH}
        showsGoogleMark={false}
        size="xl"
      />
    ),
    business: (
      <GoogleSignIn
        label="Empezar con Negocio"
        afterSignInPath={PLANS_PATH}
        showsGoogleMark={false}
        variant="outline"
        size="xl"
      />
    ),
  };
}

function buildActions(signedInStorePath: string | null): Record<Plan, ReactNode> {
  const actions =
    signedInStorePath === null ? buildSignedOutActions() : buildSignedInActions(signedInStorePath);

  return isPaymentsEnabled() ? actions : buildComingSoonActions(actions.free);
}

export function Pricing({ signedInStorePath }: PricingProps) {
  return (
    <section id="precios" className="flex flex-col gap-12 border-t px-6 py-24">
      <InView>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-4xl">Precios</h2>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Arrancá gratis. Cuando vendas más, pasate a un plan con más productos. Sin comisión por
            venta, cancelás cuando quieras.
          </p>
        </div>
      </InView>
      <PlanCards actions={buildActions(signedInStorePath)} />
    </section>
  );
}
