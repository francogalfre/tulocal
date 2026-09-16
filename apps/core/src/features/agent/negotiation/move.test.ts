import { describe, expect, test } from "bun:test";

import { computeNegotiationMove } from "@/features/agent/negotiation/move";
import type { NegotiationMove, NegotiationMoveInput } from "@/features/agent/negotiation/move";

const DEFAULT_SETTINGS = {
  maxCounterOffers: 3,
  firstConcessionPercent: 40,
  subsequentConcessionPercent: 50,
};

const LIST_PRICE_IN_ARS = 100_000;

const FLOOR_PRICE_IN_ARS = 70_000;

function buildInput(overrides: Partial<NegotiationMoveInput>): NegotiationMoveInput {
  return {
    listPriceInArs: LIST_PRICE_IN_ARS,
    floorPriceInArs: FLOOR_PRICE_IN_ARS,
    buyerOfferInArs: 50_000,
    counterOfferCount: 0,
    lastCounterOfferInArs: null,
    settings: DEFAULT_SETTINGS,
    ...overrides,
  };
}

function playLowballs(buyerOfferInArs: number, pushes: number): NegotiationMove[] {
  const moves: NegotiationMove[] = [];
  let lastCounterOfferInArs: number | null = null;

  for (let counterOfferCount = 0; counterOfferCount < pushes; counterOfferCount += 1) {
    const move = computeNegotiationMove(
      buildInput({ buyerOfferInArs, counterOfferCount, lastCounterOfferInArs }),
    );

    moves.push(move);
    lastCounterOfferInArs = move.priceInArs;
  }

  return moves;
}

describe("computeNegotiationMove", () => {
  test("first counter concedes part of the gap but never below the midpoint", () => {
    const move = computeNegotiationMove(buildInput({ buyerOfferInArs: 10_000 }));

    expect(move.kind).toBe("counter");
    expect(move.priceInArs).toBe(85_000);
  });

  test("first counter concedes forty percent of a small gap", () => {
    const move = computeNegotiationMove(buildInput({ buyerOfferInArs: 90_000 }));

    expect(move.kind).toBe("counter");
    expect(move.priceInArs).toBe(96_000);
  });

  test("subsequent counters halve the remaining gap and the final one lands on floor", () => {
    const moves = playLowballs(10_000, 3);

    expect(moves.map((move) => move.priceInArs)).toEqual([85_000, 77_500, FLOOR_PRICE_IN_ARS]);
    expect(moves[2]?.isFinal).toBe(true);
  });

  test("never goes below floor across many pushes", () => {
    const moves = playLowballs(1_000, 6);

    for (const move of moves) {
      expect(move.priceInArs).toBeGreaterThanOrEqual(FLOOR_PRICE_IN_ARS);
    }
  });

  test("past the limit it holds once and then redirects", () => {
    const moves = playLowballs(10_000, 5);

    expect(moves[3]?.kind).toBe("hold");
    expect(moves[3]?.priceInArs).toBe(FLOOR_PRICE_IN_ARS);
    expect(moves[4]?.kind).toBe("redirect");
  });

  test("accepts an offer at or above the current price without conceding", () => {
    const move = computeNegotiationMove(buildInput({ buyerOfferInArs: 120_000 }));

    expect(move).toEqual({ kind: "accept", priceInArs: LIST_PRICE_IN_ARS, isFinal: false });
  });

  test("accepts a buyer offer that beats the next counter", () => {
    const move = computeNegotiationMove(
      buildInput({ buyerOfferInArs: 90_000, counterOfferCount: 1, lastCounterOfferInArs: 96_000 }),
    );

    expect(move).toEqual({ kind: "accept", priceInArs: 90_000, isFinal: false });
  });

  test("a floor equal to the list price leaves no room", () => {
    const move = computeNegotiationMove(
      buildInput({ floorPriceInArs: LIST_PRICE_IN_ARS, buyerOfferInArs: 50_000 }),
    );

    expect(move.priceInArs).toBe(LIST_PRICE_IN_ARS);
  });
});
