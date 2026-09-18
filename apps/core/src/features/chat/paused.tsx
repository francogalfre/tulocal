"use client";

import { tulocalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { trackWhatsappClick } from "@/features/metrics/track";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PausedProps = {
  productId: string;
  agentName: string;
  productTitle: string;
  whatsappPhone: string | null;
};

export function Paused({ productId, agentName, productTitle, whatsappPhone }: PausedProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-secondary p-4">
      <div className="flex flex-col gap-0.5">
        <p className="font-heading text-lg font-semibold">{agentName} no puede responder ahora</p>
        <p className="text-[13px] text-muted-foreground">
          {whatsappPhone === null
            ? "Volvé a intentar más tarde."
            : "Escribile directo al dueño y seguí la charla por WhatsApp."}
        </p>
      </div>
      {whatsappPhone !== null ? (
        <Button
          size="xl"
          className="w-full"
          onClick={() => {
            void trackWhatsappClick(productId);
          }}
          render={
            <a
              href={buildWhatsappUrl({
                phone: whatsappPhone,
                message: `Hola, me interesa «${productTitle}». ¿Sigue disponible?`,
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
      ) : null}
    </div>
  );
}
