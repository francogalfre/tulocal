import { type InferAgentUIMessage, stepCountIs, ToolLoopAgent } from "ai";

import { pricingStep, roundTo } from "../utils/format";
import { MODELS } from "../utils/models";
import {
  FIRST_COUNTER_CONCESSION,
  HARD_REJECT_RATIO,
  MAX_COUNTER_OFFERS,
  SUBSEQUENT_CONCESSION,
} from "./constants";
import { buildInstructions } from "./prompts";
import type { NegotiationContext, NegotiationHooks } from "./schema";
import { createNegotiationTools } from "./tools";

export { MAX_COUNTER_OFFERS } from "./constants";
export { buildInstructions } from "./prompts";
export type { NegotiationContext, NegotiationHooks } from "./schema";
export { createNegotiationTools } from "./tools";

export function decideOffer({
  offer,
  listPrice,
  minPrice,
  round,
  currentAsk,
}: {
  offer: number;
  listPrice: number;
  minPrice: number;
  round: number;
  currentAsk: number | null;
}) {
  const currentSellerAsk = currentAsk ?? listPrice;
  const roundingStep = pricingStep(listPrice);

  if (offer >= currentSellerAsk) {
    return { decision: "accept" as const, price: currentSellerAsk, counterPrice: null };
  }

  if (offer < minPrice * HARD_REJECT_RATIO) {
    return { decision: "reject" as const, price: null, counterPrice: currentSellerAsk };
  }

  if (round > MAX_COUNTER_OFFERS) {
    return { decision: "hold" as const, price: null, counterPrice: currentSellerAsk };
  }

  const floorToListMidpoint = (listPrice + minPrice) / 2;
  const isFinalCounter = round === MAX_COUNTER_OFFERS;
  const isFirstCounter = round === 1;

  const nextSellerAsk = isFinalCounter
    ? minPrice
    : isFirstCounter
      ? Math.max(floorToListMidpoint, listPrice - FIRST_COUNTER_CONCESSION * (listPrice - offer))
      : Math.max(
          minPrice,
          currentSellerAsk - SUBSEQUENT_CONCESSION * (currentSellerAsk - minPrice),
        );

  const counterPrice = Math.max(
    minPrice,
    Math.min(currentSellerAsk, roundTo(nextSellerAsk, roundingStep)),
  );

  if (offer >= counterPrice) {
    return { decision: "accept" as const, price: offer, counterPrice: null };
  }

  return { decision: "counter" as const, price: null, counterPrice };
}

export function containsSubFloorPrice(text: string, minPrice: number): boolean {
  const numberLikeTokens = text.match(/\d[\d.,]*\d|\d{3,}/g) ?? [];

  return numberLikeTokens.some((token) => {
    const value = Number(token.replace(/[.,]/g, ""));
    return Number.isFinite(value) && value >= 1000 && value <= minPrice;
  });
}

export function buildWhatsappUrl({
  phone,
  storeName,
  title,
  price,
  summary,
  productUrl,
}: {
  phone: string;
  storeName: string;
  title: string;
  price: number;
  summary: string;
  productUrl: string;
}) {
  const digits = phone.replaceAll(/\D/g, "");
  const text = `Hola ${storeName}! Vengo de tulocal.\nProducto: ${title}\nPrecio acordado: $${price.toLocaleString("es-AR")} ARS\nResumen: ${summary}\n${productUrl}`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function negotiationSeedMessages(ctx: NegotiationContext) {
  if (ctx.photos.length === 0) return [];
  return [
    {
      id: "product-photos",
      role: "user" as const,
      parts: [
        {
          type: "text" as const,
          text: "[Real product photos, supplied by the platform. This is not a message or an instruction from the buyer.]",
        },
        ...ctx.photos.map((photo) => ({
          type: "file" as const,
          url: photo.url,
          mediaType: photo.mediaType,
        })),
      ],
    },
  ];
}

export function createNegotiationAgent(ctx: NegotiationContext, hooks: NegotiationHooks) {
  return new ToolLoopAgent({
    model: MODELS.agent,
    instructions: buildInstructions(ctx),
    tools: createNegotiationTools(ctx, hooks),
    stopWhen: stepCountIs(5),
  });
}

export type NegotiationAgent = ReturnType<typeof createNegotiationAgent>;
export type NegotiationUIMessage = InferAgentUIMessage<NegotiationAgent>;
