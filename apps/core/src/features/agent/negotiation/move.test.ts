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

  test("subsequent counters halve the gap and the last regular one stays just above floor", () => {
    const moves = playLowballs(10_000, 3);

    expect(moves.map((move) => move.priceInArs)).toEqual([85_000, 77_500, 70_700]);
    expect(moves.every((move) => !move.isFinal)).toBe(true);
  });

  test("only a further push after the regular counters reaches the floor", () => {
    const moves = playLowballs(10_000, 4);

    expect(moves[3]).toEqual({ kind: "counter", priceInArs: FLOOR_PRICE_IN_ARS, isFinal: true });
  });

  test("the cushion above floor rounds up to the price step", () => {
    const move = computeNegotiationMove(
      buildInput({
        listPriceInArs: 499_000,
        floorPriceInArs: 450_000,
        buyerOfferInArs: 300_000,
        counterOfferCount: 2,
        lastCounterOfferInArs: 462_000,
      }),
    );

    expect(move).toEqual({ kind: "counter", priceInArs: 455_000, isFinal: false });
  });

  test("an offer between floor and the last counter is taken after the regular counters", () => {
    const move = computeNegotiationMove(
      buildInput({ buyerOfferInArs: 70_500, counterOfferCount: 3, lastCounterOfferInArs: 70_700 }),
    );

    expect(move).toEqual({ kind: "accept", priceInArs: 70_500, isFinal: true });
  });

  test("never goes below floor across many pushes", () => {
    const moves = playLowballs(1_000, 6);

    for (const move of moves) {
      expect(move.priceInArs).toBeGreaterThanOrEqual(FLOOR_PRICE_IN_ARS);
    }
  });

  test("after reaching the floor it holds once and then redirects", () => {
    const moves = playLowballs(10_000, 6);

    expect(moves[4]?.kind).toBe("hold");
    expect(moves[4]?.priceInArs).toBe(FLOOR_PRICE_IN_ARS);
    expect(moves[5]?.kind).toBe("redirect");
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
