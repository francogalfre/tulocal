import { describe, expect, test } from "bun:test";

import { derivePublicPlace } from "@/features/store/location/privacy";
import type { Place } from "@/features/store/location/place";

const address: Place = {
  addressLine: "Bulevar Gálvez 1500, Candioti Norte, Santa Fe",
  areaName: "Candioti Norte, Santa Fe",
  latitude: -31.6379297,
  longitude: -60.691089,
  isAddress: true,
};

describe("derivePublicPlace", () => {
  test("keeps the area name and moves the point off the exact address", () => {
    const publicPlace = derivePublicPlace(address);

    expect(publicPlace.name).toBe("Candioti Norte, Santa Fe");
    expect(publicPlace.latitude).not.toBe(address.latitude);
    expect(publicPlace.longitude).not.toBe(address.longitude);
    expect(Math.abs(publicPlace.latitude - address.latitude)).toBeLessThan(0.005);
    expect(Math.abs(publicPlace.longitude - address.longitude)).toBeLessThan(0.005);
  });

  test("publishes a neighborhood pick as is", () => {
    const neighborhood: Place = { ...address, isAddress: false, areaName: "Palermo, CABA" };

    expect(derivePublicPlace(neighborhood)).toEqual({
      name: "Palermo, CABA",
      latitude: address.latitude,
      longitude: address.longitude,
    });
  });
});
