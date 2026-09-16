const LARGE_PRICE_THRESHOLD_IN_ARS = 100_000;

const LARGE_PRICE_STEP_IN_ARS = 1_000;

const SMALL_PRICE_STEP_IN_ARS = 100;

const FLOOR_PRICE_RATIO = 0.8;

const NEW_PRODUCT_POSITION = 0.75;

const USED_PRODUCT_POSITION = 0.5;

export type PriceSuggestionInput = {
  minimumPriceInArs: number | null;
  maximumPriceInArs: number | null;
  condition: "new" | "used";
};

export type PriceSuggestion = {
  listPriceInArs: number;
  floorPriceInArs: number;
};

export function roundToPriceStep(priceInArs: number): number {
  const step =
    priceInArs >= LARGE_PRICE_THRESHOLD_IN_ARS ? LARGE_PRICE_STEP_IN_ARS : SMALL_PRICE_STEP_IN_ARS;

  return Math.round(priceInArs / step) * step;
}

export function suggestPrices(input: PriceSuggestionInput): PriceSuggestion | null {
  const lowerBound = input.minimumPriceInArs ?? input.maximumPriceInArs;
  const upperBound = input.maximumPriceInArs ?? input.minimumPriceInArs;

  if (lowerBound === null || upperBound === null) {
    return null;
  }

  const position = input.condition === "new" ? NEW_PRODUCT_POSITION : USED_PRODUCT_POSITION;
  const listPriceInArs = roundToPriceStep(lowerBound + (upperBound - lowerBound) * position);

  return {
    listPriceInArs,
    floorPriceInArs: roundToPriceStep(listPriceInArs * FLOOR_PRICE_RATIO),
  };
}
