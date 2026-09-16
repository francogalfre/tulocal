import { roundToPriceStep } from "@/features/product/pipeline/pricing";

const PERCENT_DIVISOR = 100;

export type NegotiationSettings = {
  maxCounterOffers: number;
  firstConcessionPercent: number;
  subsequentConcessionPercent: number;
};

export type NegotiationMoveInput = {
  listPriceInArs: number;
  floorPriceInArs: number;
  buyerOfferInArs: number;
  counterOfferCount: number;
  lastCounterOfferInArs: number | null;
  settings: NegotiationSettings;
};

export type NegotiationMoveKind = "accept" | "counter" | "hold" | "redirect";

export type NegotiationMove = {
  kind: NegotiationMoveKind;
  priceInArs: number;
  isFinal: boolean;
};

function clampToFloor(candidateInArs: number, floorPriceInArs: number): number {
  return Math.max(roundToPriceStep(candidateInArs), floorPriceInArs);
}

function computeFirstCounter(input: NegotiationMoveInput): number {
  const gapInArs = input.listPriceInArs - input.buyerOfferInArs;
  const concededInArs =
    input.listPriceInArs - (gapInArs * input.settings.firstConcessionPercent) / PERCENT_DIVISOR;
  const midpointInArs = (input.floorPriceInArs + input.listPriceInArs) / 2;

  return clampToFloor(Math.max(concededInArs, midpointInArs), input.floorPriceInArs);
}

function computeSubsequentCounter(input: NegotiationMoveInput, currentInArs: number): number {
  const remainingGapInArs = currentInArs - input.floorPriceInArs;
  const concededInArs =
    currentInArs -
    (remainingGapInArs * input.settings.subsequentConcessionPercent) / PERCENT_DIVISOR;

  return clampToFloor(concededInArs, input.floorPriceInArs);
}

function computeCandidate(input: NegotiationMoveInput, currentInArs: number): number {
  const isFinal = input.counterOfferCount === input.settings.maxCounterOffers - 1;

  if (isFinal) {
    return input.floorPriceInArs;
  }

  if (input.counterOfferCount === 0) {
    return computeFirstCounter(input);
  }

  return computeSubsequentCounter(input, currentInArs);
}

export function computeNegotiationMove(input: NegotiationMoveInput): NegotiationMove {
  const currentInArs = input.lastCounterOfferInArs ?? input.listPriceInArs;

  if (input.buyerOfferInArs >= currentInArs) {
    return { kind: "accept", priceInArs: currentInArs, isFinal: false };
  }

  if (input.counterOfferCount === input.settings.maxCounterOffers) {
    return { kind: "hold", priceInArs: currentInArs, isFinal: true };
  }

  if (input.counterOfferCount > input.settings.maxCounterOffers) {
    return { kind: "redirect", priceInArs: currentInArs, isFinal: true };
  }

  const isFinal = input.counterOfferCount === input.settings.maxCounterOffers - 1;
  const candidateInArs = computeCandidate(input, currentInArs);

  if (input.buyerOfferInArs >= candidateInArs) {
    return { kind: "accept", priceInArs: input.buyerOfferInArs, isFinal };
  }

  return { kind: "counter", priceInArs: candidateInArs, isFinal };
}
