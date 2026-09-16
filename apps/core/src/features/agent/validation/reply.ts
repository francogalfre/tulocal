import { extractPricesInArs } from "@/features/agent/validation/prices";
import type { NegotiationMove } from "@/features/agent/negotiation/move";
import { formatArs } from "@/lib/money";

export type ReplySafetyInput = {
  text: string;
  floorPriceInArs: number;
  isFloorMentionAllowed: boolean;
};

export function isReplySafe(input: ReplySafetyInput): boolean {
  const prices = extractPricesInArs(input.text);

  return prices.every((priceInArs) => {
    if (priceInArs === input.floorPriceInArs) {
      return input.isFloorMentionAllowed;
    }

    return priceInArs > input.floorPriceInArs;
  });
}

export function buildFallbackReply(move: NegotiationMove | null): string {
  if (move === null) {
    return "Perdón, me confundí con el número. ¿Qué precio tenías en mente?";
  }

  const price = formatArs(move.priceInArs);

  if (move.kind === "accept") {
    return `Dale, cerramos en ${price}.`;
  }

  if (move.kind === "hold") {
    return `${price} es mi número, no puedo bajar más.`;
  }

  if (move.kind === "redirect") {
    return "Te paso con el dueño para que lo charlen directo.";
  }

  if (move.isFinal) {
    return `Lo último que puedo hacer es ${price}.`;
  }

  return `Te lo puedo dejar en ${price}.`;
}
