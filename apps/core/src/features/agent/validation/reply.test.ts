import { describe, expect, test } from "bun:test";

import { extractPricesInArs } from "@/features/agent/validation/prices";
import { buildFallbackReply, isReplySafe } from "@/features/agent/validation/reply";

const FLOOR_PRICE_IN_ARS = 70_000;

describe("extractPricesInArs", () => {
  test("reads formatted pesos, bare thousands and slang", () => {
    expect(
      extractPricesInArs("Te lo dejo en $ 85.000, no en 70 lucas ni en 72k ni 75 mil"),
    ).toEqual([85_000, 70_000, 72_000, 75_000]);
  });

  test("ignores counts, years and sizes", () => {
    expect(extractPricesInArs("Tiene 3 fotos, es modelo 2019 y rodado 29")).toEqual([]);
  });

  test("ignores quantities followed by a unit", () => {
    expect(extractPricesInArs("batería de 5.000 mAh, pantalla de 1.000 Hz y 500 GB")).toEqual([]);
  });

  test("handles a comma decimal with a multiplier", () => {
    expect(extractPricesInArs("serían 72,5 lucas")).toEqual([72_500]);
  });
});

describe("isReplySafe", () => {
  test("accepts prices above the floor", () => {
    expect(
      isReplySafe({
        text: "Te lo dejo en $85.000",
        floorPriceInArs: FLOOR_PRICE_IN_ARS,
        isFloorMentionAllowed: false,
      }),
    ).toBe(true);
  });

  test("rejects a price below the floor", () => {
    expect(
      isReplySafe({
        text: "Bueno, dale, $65.000 y cerramos",
        floorPriceInArs: FLOOR_PRICE_IN_ARS,
        isFloorMentionAllowed: true,
      }),
    ).toBe(false);
  });

  test("rejects the floor itself unless the move landed on it", () => {
    const text = "Lo último es $70.000";

    expect(
      isReplySafe({ text, floorPriceInArs: FLOOR_PRICE_IN_ARS, isFloorMentionAllowed: false }),
    ).toBe(false);
    expect(
      isReplySafe({ text, floorPriceInArs: FLOOR_PRICE_IN_ARS, isFloorMentionAllowed: true }),
    ).toBe(true);
  });

  test("a reply without prices is safe", () => {
    expect(
      isReplySafe({
        text: "Eso no lo sé, le pregunto al dueño",
        floorPriceInArs: FLOOR_PRICE_IN_ARS,
        isFloorMentionAllowed: false,
      }),
    ).toBe(true);
  });
});

describe("buildFallbackReply", () => {
  test("phrases every move kind with the move's price", () => {
    expect(buildFallbackReply({ kind: "counter", priceInArs: 85_000, isFinal: false })).toContain(
      "85.000",
    );
    expect(buildFallbackReply({ kind: "counter", priceInArs: 70_000, isFinal: true })).toContain(
      "Lo último",
    );
    expect(buildFallbackReply({ kind: "hold", priceInArs: 70_000, isFinal: true })).toContain(
      "no puedo bajar",
    );
    expect(buildFallbackReply({ kind: "redirect", priceInArs: 70_000, isFinal: true })).toContain(
      "dueño",
    );
    expect(buildFallbackReply({ kind: "accept", priceInArs: 90_000, isFinal: false })).toContain(
      "cerramos",
    );
    expect(buildFallbackReply(null)).toContain("precio");
  });
});
