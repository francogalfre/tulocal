import type { ProductCondition } from "@/features/product/condition";

const LARGE_PRICE_THRESHOLD_IN_ARS = 100_000;

const LARGE_PRICE_STEP_IN_ARS = 1_000;

const SMALL_PRICE_STEP_IN_ARS = 100;

const FLOOR_PRICE_RATIO = 0.8;

const OUTLIER_RATIO = 3;

const CONDITION_PRICE_POSITIONS: Record<ProductCondition, number> = {
  new: 0.75,
  like_new: 0.6,
  good: 0.5,
  worn: 0.35,
};

export type PriceRange = {
  minimumPriceInArs: number;
  maximumPriceInArs: number;
};

export type PriceSuggestionInput = {
  pricesInArs: number[];
  condition: ProductCondition;
};

export type PriceSuggestion = PriceRange & {
  listPriceInArs: number;
  floorPriceInArs: number;
};

function computeMedian(sortedPrices: number[]): number | null {
  const middle = Math.floor(sortedPrices.length / 2);
  const upper = sortedPrices[middle];
  const lower = sortedPrices[middle - 1];

  if (upper === undefined) {
    return null;
  }

  if (sortedPrices.length % 2 === 1 || lower === undefined) {
    return upper;
  }

  return (lower + upper) / 2;
}

export function findPriceStepInArs(priceInArs: number): number {
  return priceInArs >= LARGE_PRICE_THRESHOLD_IN_ARS
    ? LARGE_PRICE_STEP_IN_ARS
    : SMALL_PRICE_STEP_IN_ARS;
}

export function roundToPriceStep(priceInArs: number): number {
  const stepInArs = findPriceStepInArs(priceInArs);

  return Math.round(priceInArs / stepInArs) * stepInArs;
}

export function summarizePriceRange(pricesInArs: number[]): PriceRange | null {
  const sortedPrices = [...pricesInArs].sort((first, second) => first - second);
  const median = computeMedian(sortedPrices);

  if (median === null) {
    return null;
  }

  const plausiblePrices = sortedPrices.filter(
    (price) => price >= median / OUTLIER_RATIO && price <= median * OUTLIER_RATIO,
  );
  const minimumPriceInArs = plausiblePrices[0];
  const maximumPriceInArs = plausiblePrices[plausiblePrices.length - 1];

  if (minimumPriceInArs === undefined || maximumPriceInArs === undefined) {
    return null;
  }

  return { minimumPriceInArs, maximumPriceInArs };
}

export function suggestPrices(input: PriceSuggestionInput): PriceSuggestion | null {
  const range = summarizePriceRange(input.pricesInArs);

  if (range === null) {
    return null;
  }

  const position = CONDITION_PRICE_POSITIONS[input.condition];
  const spread = range.maximumPriceInArs - range.minimumPriceInArs;
  const listPriceInArs = roundToPriceStep(range.minimumPriceInArs + spread * position);

  return {
    minimumPriceInArs: range.minimumPriceInArs,
    maximumPriceInArs: range.maximumPriceInArs,
    listPriceInArs,
    floorPriceInArs: roundToPriceStep(listPriceInArs * FLOOR_PRICE_RATIO),
  };
}
