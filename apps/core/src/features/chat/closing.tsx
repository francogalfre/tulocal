"use client";

import { motion } from "motion/react";

import { tulocalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/amount";
import type { ConversationClosing } from "@/features/conversation/closing";
import { trackWhatsappClick } from "@/features/metrics/track";
import { riseVariants } from "@/lib/motion/rise";
import { formatArs } from "@/lib/money";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type ClosingProps = {
  productId: string;
  closing: ConversationClosing;
  agentName: string;
  productTitle: string;
  whatsappPhone: string;
};

function buildClosingMessage(input: ClosingProps): string {
  const opening = `Hola, hablé con ${input.agentName} por «${input.productTitle}»`;

  if (input.closing.agreedPriceInArs === null) {
    return `${opening} y lo quiero. ¿Cómo seguimos?`;
  }

  return `${opening} y acordamos ${formatArs(input.closing.agreedPriceInArs)}. ¿Cómo seguimos?`;
}

export function Closing(props: ClosingProps) {
  const { agreedPriceInArs } = props.closing;

  return (
    <motion.div
      variants={riseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-4 rounded-2xl bg-secondary p-4"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="font-heading text-lg font-semibold">Ya le avisé al dueño</p>
          <p className="text-[13px] text-muted-foreground">
            Coordiná el pago y la entrega directo con él. Ningún pago pasa por tulocal.
          </p>
        </div>
        {agreedPriceInArs !== null ? (
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-xs font-medium text-muted-foreground">Acordado</span>
            <Amount
              amountInArs={agreedPriceInArs}
              className="font-heading text-2xl font-semibold text-brand-deep"
            />
          </div>
        ) : null}
      </div>
      <Button
        size="xl"
        className="w-full"
        onClick={() => {
          void trackWhatsappClick(props.productId);
        }}
        render={
          <a
            href={buildWhatsappUrl({
              phone: props.whatsappPhone,
              message: buildClosingMessage(props),
            })}
            target="_blank"
            rel="noreferrer"
          />
        }
        nativeButton={false}
      >
        <tulocalIcons.whatsapp data-icon="inline-start" />
        Escribirle por WhatsApp
      </Button>
    </motion.div>
  );
}
