import { findPriceStepInArs, roundToPriceStep } from "@/features/product/pipeline/pricing";

const PERCENT_DIVISOR = 100;

const FLOOR_CUSHION_PERCENT = 1;

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

function computePriceJustAboveFloor(input: NegotiationMoveInput): number {
  const stepInArs = findPriceStepInArs(input.floorPriceInArs);
  const cushionInArs = (input.floorPriceInArs * FLOOR_CUSHION_PERCENT) / PERCENT_DIVISOR;
  const roundedCushionInArs = Math.max(Math.ceil(cushionInArs / stepInArs) * stepInArs, stepInArs);

  return Math.min(input.floorPriceInArs + roundedCushionInArs, input.listPriceInArs);
}

function clampAboveFloor(candidateInArs: number, input: NegotiationMoveInput): number {
  return Math.max(roundToPriceStep(candidateInArs), computePriceJustAboveFloor(input));
}

function computeFirstCounter(input: NegotiationMoveInput): number {
  const gapInArs = input.listPriceInArs - input.buyerOfferInArs;
  const concededInArs =
    input.listPriceInArs - (gapInArs * input.settings.firstConcessionPercent) / PERCENT_DIVISOR;
  const midpointInArs = (input.floorPriceInArs + input.listPriceInArs) / 2;

  return clampAboveFloor(Math.max(concededInArs, midpointInArs), input);
}

function computeSubsequentCounter(input: NegotiationMoveInput, currentInArs: number): number {
  const remainingGapInArs = currentInArs - input.floorPriceInArs;
  const concededInArs =
    currentInArs -
    (remainingGapInArs * input.settings.subsequentConcessionPercent) / PERCENT_DIVISOR;

  return clampAboveFloor(concededInArs, input);
}

function computeCandidate(input: NegotiationMoveInput, currentInArs: number): number {
  const isLastRegularCounter = input.counterOfferCount === input.settings.maxCounterOffers - 1;

  if (isLastRegularCounter) {
    return Math.min(computePriceJustAboveFloor(input), currentInArs);
  }

  if (input.counterOfferCount === 0) {
    return computeFirstCounter(input);
  }

  return computeSubsequentCounter(input, currentInArs);
}

function computeMoveAfterRegularCounters(
  input: NegotiationMoveInput,
  currentInArs: number,
): NegotiationMove {
  if (currentInArs > input.floorPriceInArs) {
    if (input.buyerOfferInArs >= input.floorPriceInArs) {
      return { kind: "accept", priceInArs: input.buyerOfferInArs, isFinal: true };
    }

    return { kind: "counter", priceInArs: input.floorPriceInArs, isFinal: true };
  }

  if (input.counterOfferCount <= input.settings.maxCounterOffers + 1) {
    return { kind: "hold", priceInArs: currentInArs, isFinal: true };
  }

  return { kind: "redirect", priceInArs: currentInArs, isFinal: true };
}

export function computeNegotiationMove(input: NegotiationMoveInput): NegotiationMove {
  const currentInArs = input.lastCounterOfferInArs ?? input.listPriceInArs;

  if (input.buyerOfferInArs >= currentInArs) {
    return { kind: "accept", priceInArs: currentInArs, isFinal: false };
  }

  if (input.counterOfferCount >= input.settings.maxCounterOffers) {
    return computeMoveAfterRegularCounters(input, currentInArs);
  }

  const candidateInArs = computeCandidate(input, currentInArs);

  if (input.buyerOfferInArs >= candidateInArs) {
    return { kind: "accept", priceInArs: input.buyerOfferInArs, isFinal: false };
  }

  return { kind: "counter", priceInArs: candidateInArs, isFinal: false };
}
