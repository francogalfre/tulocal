import { cn } from "cn";
import type { ReactNode } from "react";

import { InView } from "@/components/motion/inview";
import { Rise } from "@/components/motion/rise";
import { ChatPrototype } from "@/features/landing/prototypes/chat";
import { ListingPrototype } from "@/features/landing/prototypes/listing";
import { PricingPrototype } from "@/features/landing/prototypes/pricing";
import { StorePrototype } from "@/features/landing/prototypes/store";

type Feature = {
  title: string;
  detail: string;
  prototype: ReactNode;
  cellClassName: string;
};

const FEATURES: Feature[] = [
  {
    title: "Un agente que negocia por vos",
    detail: "Responde consultas, regatea y nunca baja de tu precio mínimo.",
    prototype: <ChatPrototype />,
    cellClassName: "md:col-span-2",
  },
  {
    title: "Precio con datos reales",
    detail: "Lo que piden por uno igual al tuyo.",
    prototype: <PricingPrototype />,
    cellClassName: "",
  },
  {
    title: "Tu tienda, tu link",
    detail: "Con su QR para pegar en la vidriera.",
    prototype: <StorePrototype />,
    cellClassName: "",
  },
  {
    title: "De la foto a la publicación",
    detail: "Con tu foto arma tres mejores, el título y el precio. Se vende más rápido.",
    prototype: <ListingPrototype />,
    cellClassName: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section id="como-funciona" className="flex flex-col gap-12 border-t px-6 py-24">
      <InView>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-4xl">Cómo funciona</h2>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            De la foto a la venta, sin vueltas.
          </p>
        </div>
      </InView>
      <InView stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Rise
            as="article"
            key={feature.title}
            className={cn(
              "flex flex-col gap-4 rounded-2xl bg-secondary/80 p-2",
              feature.cellClassName,
            )}
          >
            <div className="flex flex-1 items-center justify-center rounded-xl bg-background px-6 py-8">
              {feature.prototype}
            </div>
            <div className="flex flex-col gap-1 px-4 pb-3">
              <h3 className="font-heading text-lg font-medium">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.detail}</p>
            </div>
          </Rise>
        ))}
      </InView>
    </section>
  );
}
