import { tool } from "ai";
import { z } from "zod";

import { createEscalationOnce } from "@/features/agent/escalate";

const SUMMARY_MAX_LENGTH = 300;

const PATTERN_LABELS = {
  courier_transfer: "Courier o retiro por terceros con transferencia fuera de la plataforma",
  phishing_link: "Link para confirmar o desbloquear un pago",
  urgency: "Presión para cerrar ya y saltear pasos",
};

export const flagScam = tool({
  description:
    "Usala cuando el comprador proponga que un courier o un tercero retire el producto pagando por transferencia, mande un link para confirmar o desbloquear un pago, o presione para cerrar ya salteando pasos. Avisa al dueño. Igual seguí contestando preguntas legítimas.",
  inputSchema: z.object({
    pattern: z.enum(["courier_transfer", "phishing_link", "urgency"]),
    summary: z
      .string()
      .trim()
      .min(1)
      .max(SUMMARY_MAX_LENGTH)
      .describe("Qué dijo el comprador, en una oración, para que el dueño entienda el riesgo."),
  }),
  contextSchema: z.object({
    conversationId: z.uuid(),
    productId: z.uuid(),
    storeId: z.uuid(),
  }),
  execute: async ({ pattern, summary }, { context }) => {
    const status = await createEscalationOnce({
      conversationId: context.conversationId,
      productId: context.productId,
      storeId: context.storeId,
      kind: "scam_suspected",
      summary: `${PATTERN_LABELS[pattern]}. ${summary}`,
      agreedPriceInArs: null,
    });

    return { status };
  },
});
