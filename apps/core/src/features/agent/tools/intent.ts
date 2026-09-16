import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";
import { escalations } from "@tulocal/database/schema/escalations";

import { createEscalationOnce } from "@/features/agent/escalate";

const SUMMARY_MAX_LENGTH = 300;

export const signalBuyIntent = tool({
  description:
    "Usala una vez cuando el comprador muestre intención real de comprar: dice que lo lleva, acepta un precio, o pregunta por retiro, envío, pago o reserva dando por hecha la compra. No la uses por preguntas sobre el producto ni por sondeos de precio.",
  inputSchema: z.object({
    summary: z
      .string()
      .trim()
      .min(1)
      .max(SUMMARY_MAX_LENGTH)
      .describe(
        "Resumen de una o dos oraciones para el dueño: qué quiere el comprador y qué se habló.",
      ),
  }),
  contextSchema: z.object({
    conversationId: z.uuid(),
    productId: z.uuid(),
    storeId: z.uuid(),
  }),
  execute: async ({ summary }, { context }) => {
    const conversation = await database.query.conversations.findFirst({
      where: eq(conversations.id, context.conversationId),
      columns: { agreedPriceInArs: true },
    });
    const status = await createEscalationOnce({
      conversationId: context.conversationId,
      productId: context.productId,
      storeId: context.storeId,
      kind: "buy_intent",
      summary,
      agreedPriceInArs: conversation?.agreedPriceInArs ?? null,
    });

    if (status === "existing") {
      await database
        .update(escalations)
        .set({ summary })
        .where(
          and(
            eq(escalations.conversationId, context.conversationId),
            eq(escalations.kind, "buy_intent"),
          ),
        );
    }

    return { status };
  },
});
