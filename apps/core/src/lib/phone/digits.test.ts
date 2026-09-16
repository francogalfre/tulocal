import { describe, expect, test } from "bun:test";

import { extractArgentinePhoneDigits } from "@/lib/phone/digits";
import { formatArgentinePhone } from "@/lib/phone/format";

describe("extractArgentinePhoneDigits", () => {
  test("keeps a plain ten digit number", () => {
    expect(extractArgentinePhoneDigits("11 2345-6789")).toBe("1123456789");
  });

  test("strips the country code and the mobile nine", () => {
    expect(extractArgentinePhoneDigits("+54 9 342 406-9680")).toBe("3424069680");
  });

  test("strips the stored number without the mobile nine", () => {
    expect(extractArgentinePhoneDigits("+543424069680")).toBe("3424069680");
  });

  test("strips the trunk zero and the legacy fifteen", () => {
    expect(extractArgentinePhoneDigits("0342 15 406 9680")).toBe("3424069680");
    expect(extractArgentinePhoneDigits("011 15 2345 6789")).toBe("1123456789");
  });

  test("caps at ten digits", () => {
    expect(extractArgentinePhoneDigits("112345678999")).toBe("1123456789");
  });
});

describe("formatArgentinePhone", () => {
  test("groups a Buenos Aires number", () => {
    expect(formatArgentinePhone("1123456789")).toBe("11 2345-6789");
  });

  test("groups a three digit area code", () => {
    expect(formatArgentinePhone("3424069680")).toBe("342 406-9680");
  });

  test("groups a four digit area code", () => {
    expect(formatArgentinePhone("2966234567")).toBe("2966 23-4567");
  });

  test("formats partial input progressively", () => {
    expect(formatArgentinePhone("11")).toBe("11");
    expect(formatArgentinePhone("1123")).toBe("11 23");
    expect(formatArgentinePhone("112345")).toBe("11 2345");
    expect(formatArgentinePhone("1123456")).toBe("11 2345-6");
  });
});
