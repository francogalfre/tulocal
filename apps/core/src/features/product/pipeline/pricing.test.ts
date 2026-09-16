import { describe, expect, test } from "bun:test";

import {
  roundToPriceStep,
  suggestPrices,
  summarizePriceRange,
} from "@/features/product/pipeline/pricing";

describe("summarizePriceRange", () => {
  test("returns null without prices", () => {
    expect(summarizePriceRange([])).toBeNull();
  });

  test("collapses a single price into a flat range", () => {
    expect(summarizePriceRange([350_000])).toEqual({
      minimumPriceInArs: 350_000,
      maximumPriceInArs: 350_000,
    });
  });

  test("orders two prices", () => {
    expect(summarizePriceRange([420_000, 380_000])).toEqual({
      minimumPriceInArs: 380_000,
      maximumPriceInArs: 420_000,
    });
  });

  test("drops an installment sized outlier", () => {
    const prices = [
      395_000, 400_000, 420_000, 430_000, 450_000, 460_000, 479_900, 490_000, 500_000, 78_744,
    ];

    expect(summarizePriceRange(prices)).toEqual({
      minimumPriceInArs: 395_000,
      maximumPriceInArs: 500_000,
    });
  });
});

describe("suggestPrices", () => {
  const pricesInArs = [100_000, 200_000];

  test("returns null without prices", () => {
    expect(suggestPrices({ pricesInArs: [], condition: "good" })).toBeNull();
  });

  test("positions a new product near the top of the range", () => {
    expect(suggestPrices({ pricesInArs, condition: "new" })?.listPriceInArs).toBe(175_000);
  });

  test("positions a like new product above the middle", () => {
    expect(suggestPrices({ pricesInArs, condition: "like_new" })?.listPriceInArs).toBe(160_000);
  });

  test("positions a good product in the middle", () => {
    expect(suggestPrices({ pricesInArs, condition: "good" })?.listPriceInArs).toBe(150_000);
  });

  test("positions a worn product below the middle", () => {
    expect(suggestPrices({ pricesInArs, condition: "worn" })?.listPriceInArs).toBe(135_000);
  });

  test("floors at eighty percent of the list price", () => {
    expect(suggestPrices({ pricesInArs, condition: "good" })?.floorPriceInArs).toBe(120_000);
  });
});

describe("roundToPriceStep", () => {
  test("rounds small prices to hundreds", () => {
    expect(roundToPriceStep(12_345)).toBe(12_300);
  });

  test("rounds large prices to thousands", () => {
    expect(roundToPriceStep(123_456)).toBe(123_000);
  });
});
