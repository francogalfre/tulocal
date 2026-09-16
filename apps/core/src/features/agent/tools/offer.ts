import { tool } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";

import { createEscalationOnce } from "@/features/agent/escalate";
import { computeNegotiationMove } from "@/features/agent/negotiation/move";
import type { NegotiationMove } from "@/features/agent/negotiation/move";
import { formatArs } from "@/lib/money";

export const negotiationMoveOutputSchema = z.object({
  kind: z.enum(["accept", "counter", "hold", "redirect"]),
  priceInArs: z.number().int(),
  priceLabel: z.string(),
  isFinal: z.boolean(),
});

export type NegotiationMoveOutput = z.infer<typeof negotiationMoveOutputSchema>;

const offerContextSchema = z.object({
  conversationId: z.uuid(),
  productId: z.uuid(),
  storeId: z.uuid(),
  listPriceInArs: z.number().int().positive(),
  floorPriceInArs: z.number().int().positive(),
  settings: z.object({
    maxCounterOffers: z.number().int().nonnegative(),
    firstConcessionPercent: z.number().int().min(0).max(100),
    subsequentConcessionPercent: z.number().int().min(0).max(100),
  }),
});

type OfferContext = z.infer<typeof offerContextSchema>;

async function persistMove(
  context: OfferContext,
  buyerOfferInArs: number,
  move: NegotiationMove,
): Promise<void> {
  if (move.kind === "accept") {
    await database
      .update(conversations)
      .set({ lastBuyerOfferInArs: buyerOfferInArs, agreedPriceInArs: move.priceInArs })
      .where(eq(conversations.id, context.conversationId));

    await createEscalationOnce({
      conversationId: context.conversationId,
      productId: context.productId,
      storeId: context.storeId,
      kind: "buy_intent",
      summary: `Acordaron ${formatArs(move.priceInArs)} en el chat.`,
      agreedPriceInArs: move.priceInArs,
    });
    return;
  }

  const conversation = await database.query.conversations.findFirst({
    where: eq(conversations.id, context.conversationId),
    columns: { counterOfferCount: true },
  });

  if (conversation === undefined) {
    throw new Error("La conversación no existe");
  }

  await database
    .update(conversations)
    .set({
      lastBuyerOfferInArs: buyerOfferInArs,
      lastCounterOfferInArs: move.priceInArs,
      counterOfferCount: conversation.counterOfferCount + 1,
    })
    .where(eq(conversations.id, context.conversationId));
}

export const respondToOffer = tool({
  description:
    "Usala cada vez que el comprador proponga un precio, pida una rebaja, pregunte por el mínimo o por tu mejor precio. Devuelve el único número que podés decir. Nunca digas un precio que no haya salido de acá.",
  inputSchema: z.object({
    buyerOfferInArs: z
      .number()
      .int()
      .positive()
      .describe(
        "La oferta del comprador en pesos argentinos, como entero. Si pregunta por el mínimo sin ofrecer, usá 1.",
      ),
  }),
  contextSchema: offerContextSchema,
  execute: async ({ buyerOfferInArs }, { context }): Promise<NegotiationMoveOutput> => {
    const conversation = await database.query.conversations.findFirst({
      where: eq(conversations.id, context.conversationId),
      columns: { counterOfferCount: true, lastCounterOfferInArs: true },
    });

    if (conversation === undefined) {
      throw new Error("La conversación no existe");
    }

    const move = computeNegotiationMove({
      listPriceInArs: context.listPriceInArs,
      floorPriceInArs: context.floorPriceInArs,
      buyerOfferInArs,
      counterOfferCount: conversation.counterOfferCount,
      lastCounterOfferInArs: conversation.lastCounterOfferInArs,
      settings: context.settings,
    });

    await persistMove(context, buyerOfferInArs, move);

    return {
      kind: move.kind,
      priceInArs: move.priceInArs,
      priceLabel: formatArs(move.priceInArs),
      isFinal: move.isFinal,
    };
  },
});
