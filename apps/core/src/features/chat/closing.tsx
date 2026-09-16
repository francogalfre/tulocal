import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ConversationClosing } from "@/features/conversation/closing";
import { formatArs } from "@/lib/money";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type ClosingProps = {
  closing: ConversationClosing;
  agentName: string;
  productTitle: string;
  whatsappPhone: string | null;
};

function buildClosingMessage(input: ClosingProps): string {
  const opening = `Hola, hablé con ${input.agentName} por «${input.productTitle}»`;

  if (input.closing.agreedPriceInArs === null) {
    return `${opening} y lo quiero. ¿Cómo seguimos?`;
  }

  return `${opening} y acordamos ${formatArs(input.closing.agreedPriceInArs)}. ¿Cómo seguimos?`;
}

export function Closing(props: ClosingProps) {
  if (!props.closing.hasBuyIntent || props.whatsappPhone === null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border p-4">
      <p className="font-heading text-lg font-semibold">Ya le avisamos al dueño</p>
      <p className="text-sm text-muted-foreground">
        Cerrá directo con él por WhatsApp. Ningún pago pasa por tulocal.
      </p>
      <Button
        size="xl"
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
        <MessageCircle data-icon="inline-start" />
        Cerrar con el dueño por WhatsApp
      </Button>
    </div>
  );
}
