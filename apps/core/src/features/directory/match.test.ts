import { describe, expect, test } from "bun:test";

import { parseDirectoryQuery, searchDirectory } from "@/features/directory/match";
import type { DirectoryProduct, DirectoryStore } from "@/features/directory/listing";

const monstera: DirectoryProduct = {
  id: "monstera",
  title: "Monstera deliciosa",
  description: "Planta de interior en maceta de barro.",
  brand: null,
  model: null,
  category: "jardin",
  listPriceInArs: 15000,
  coverUrl: null,
  storeName: "Vivero del Sol",
  storeHandle: "vivero-del-sol",
  verifiedPlanName: null,
  promotionRank: 0,
};

const notebook: DirectoryProduct = {
  id: "notebook",
  title: "Notebook ThinkPad",
  description: "Poco uso, con cargador.",
  brand: "Lenovo",
  model: "T14",
  category: "computacion",
  listPriceInArs: 600000,
  coverUrl: null,
  storeName: "Usados Palermo",
  storeHandle: "usados-palermo",
  verifiedPlanName: "Pro",
  promotionRank: 1,
};

const vivero: DirectoryStore = {
  id: "vivero",
  name: "Vivero del Sol",
  handle: "vivero-del-sol",
  description: "Plantas de interior y exterior, macetas y sustratos.",
  avatarUrl: null,
  bannerUrl: null,
  locationName: "Rosario, Santa Fe",
  verifiedPlanName: null,
  promotionRank: 0,
  products: [monstera],
};

const usados: DirectoryStore = {
  id: "usados",
  name: "Usados Palermo",
  handle: "usados-palermo",
  description: null,
  avatarUrl: null,
  bannerUrl: null,
  locationName: "Palermo, CABA",
  verifiedPlanName: "Pro",
  promotionRank: 1,
  products: [notebook],
};

const directory = [usados, vivero];

describe("searchDirectory", () => {
  test("returns every store and no products for an empty query", () => {
    expect(searchDirectory(directory, "  ")).toEqual({ stores: directory, products: [] });
  });

  test("finds a store by a word in its description", () => {
    expect(searchDirectory(directory, "plantas").stores).toEqual([vivero]);
  });

  test("ignores accents and case", () => {
    expect(searchDirectory(directory, "ROSÁRIO").stores).toEqual([vivero]);
    expect(searchDirectory(directory, "computacion").products).toEqual([notebook]);
  });

  test("requires every term to match", () => {
    expect(searchDirectory(directory, "notebook lenovo").products).toEqual([notebook]);
    expect(searchDirectory(directory, "notebook maceta").products).toEqual([]);
  });

  test("matches a plural search against a singular word", () => {
    expect(searchDirectory(directory, "macetas").products).toEqual([monstera]);
    expect(searchDirectory(directory, "notebooks").products).toEqual([notebook]);
  });

  test("puts products of paid stores first when the match is equally good", () => {
    const freeNotebook: DirectoryProduct = { ...notebook, id: "free", promotionRank: 0 };
    const promotedDirectory = [{ ...vivero, products: [freeNotebook] }, usados];

    expect(searchDirectory(promotedDirectory, "notebook").products).toEqual([
      notebook,
      freeNotebook,
    ]);
  });

  test("finds products by brand and description", () => {
    expect(searchDirectory(directory, "lenovo").products).toEqual([notebook]);
    expect(searchDirectory(directory, "planta").products).toEqual([monstera]);
  });
});

describe("parseDirectoryQuery", () => {
  test("keeps the first value and trims it", () => {
    expect(parseDirectoryQuery(["  plantas ", "otro"])).toBe("plantas");
    expect(parseDirectoryQuery(undefined)).toBe("");
  });
});
