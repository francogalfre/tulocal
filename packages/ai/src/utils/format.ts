export type ImageInput = { data: Uint8Array; mediaType: string };

const LARGE_PRICE_THRESHOLD = 100_000;
const LARGE_PRICE_STEP = 1000;
const SMALL_PRICE_STEP = 100;

export const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function pricingStep(price: number): number {
  return price >= LARGE_PRICE_THRESHOLD ? LARGE_PRICE_STEP : SMALL_PRICE_STEP;
}
