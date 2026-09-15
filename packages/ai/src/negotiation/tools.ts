import { tool } from "ai";
import { z } from "zod";

import { buildWhatsappUrl, decideOffer } from "./index";
import type { NegotiationContext, NegotiationHooks } from "./schema";

export function createNegotiationTools(ctx: NegotiationContext, hooks: NegotiationHooks) {
  const negotiationState = { ...ctx.state };

  const evaluateOffer = tool({
    description:
      "Evaluate a buyer's price offer (in Argentine pesos) and return whether to accept, counter, hold firm or reject. Call this EVERY time the buyer proposes a number, including as an answer to an indirect question about the lowest price.",
    inputSchema: z.object({
      offer: z.number().int().positive().describe("Buyer's offer in ARS"),
    }),
    execute: async ({ offer }) => {
      if (negotiationState.status === "deal") {
        return {
          decision: "closed" as const,
          agreedPrice: negotiationState.agreedPrice,
          counterPrice: null,
          offer,
        };
      }

      negotiationState.round += 1;

      const result = decideOffer({
        offer,
        listPrice: ctx.product.listPrice,
        minPrice: ctx.product.minPrice,
        round: negotiationState.round,
        currentAsk: negotiationState.currentAsk,
      });

      negotiationState.lastOffer = offer;
      if (result.decision === "counter") {
        negotiationState.currentAsk = result.counterPrice;
      }

      await hooks.onOffer({
        round: negotiationState.round,
        currentAsk: negotiationState.currentAsk ?? ctx.product.listPrice,
        lastOffer: offer,
      });

      return { ...result, offer, round: negotiationState.round };
    },
  });

  const closeDeal = tool({
    description:
      "Close the deal once buyer and seller agreed on a price. Call this ONCE, with the agreed price and a short summary of what was discussed (price, terms, pickup/delivery if mentioned).",
    inputSchema: z.object({
      agreedPrice: z.number().int().positive(),
      summary: z.string().max(400),
    }),
    execute: async ({ agreedPrice, summary }) => {
      if (negotiationState.status === "deal" && negotiationState.agreedPrice) {
        return {
          ok: true as const,
          agreedPrice: negotiationState.agreedPrice,
          summary,
          whatsappUrl: buildWhatsappUrl({
            phone: ctx.store.whatsappPhone,
            storeName: ctx.store.name,
            title: ctx.product.title,
            price: negotiationState.agreedPrice,
            summary,
            productUrl: ctx.productUrl,
          }),
        };
      }

      if (agreedPrice < ctx.product.minPrice) {
        return {
          ok: false as const,
          error: "That price is not valid. Negotiate again using evaluateOffer.",
        };
      }

      const whatsappUrl = buildWhatsappUrl({
        phone: ctx.store.whatsappPhone,
        storeName: ctx.store.name,
        title: ctx.product.title,
        price: agreedPrice,
        summary,
        productUrl: ctx.productUrl,
      });

      negotiationState.status = "deal";
      negotiationState.agreedPrice = agreedPrice;
      await hooks.onDeal({ agreedPrice, summary, whatsappUrl });

      return { ok: true as const, agreedPrice, summary, whatsappUrl };
    },
  });

  return { evaluateOffer, closeDeal };
}
