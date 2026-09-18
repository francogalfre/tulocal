import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";

import type { NegotiationSettings } from "@/features/agent/negotiation/move";
import type { AgentVoice } from "@/features/agent/voice";
import type { ProductCategory } from "@/features/product/category";
import type { ProductCondition } from "@/features/product/condition";

const MAX_AGENT_COMPARABLES = 8;
const MAX_INSPECTED_PHOTOS = 6;
const MAX_LISTING_PHOTOS = 6;

export type AgentProduct = {
  id: string;
  title: string;
  description: string | null;
  category: ProductCategory | null;
  brand: string | null;
  model: string | null;
  condition: ProductCondition | null;
  conditionNotes: string | null;
  attributes: string[];
  sellerNotes: string | null;
  facts: string[];
  listPriceInArs: number;
  floorPriceInArs: number;
  photoUrls: string[];
  listingPhotoUrls: string[];
};

export type AgentStore = {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  locationName: string | null;
  agentName: string;
  agentVoice: AgentVoice;
  agentOpensNegotiation: boolean;
  agentContext: string | null;
  whatsappPhone: string | null;
  settings: NegotiationSettings;
};

export type AgentComparable = {
  title: string;
  priceInArs: number;
};

export type AgentQuestion = {
  question: string;
  answer: string | null;
  status: "pending" | "answered";
};

export type AgentContext = {
  product: AgentProduct;
  store: AgentStore;
  questions: AgentQuestion[];
  comparables: AgentComparable[];
};

type StoredImage = {
  url: string;
  kind: "original" | "primary" | "contextual";
};

function selectPhotoUrlsForInspection(storedImages: StoredImage[]): string[] {
  const originals = storedImages.filter((image) => image.kind === "original");
  const inspected = originals.length > 0 ? originals : storedImages;

  return inspected.slice(0, MAX_INSPECTED_PHOTOS).map((image) => image.url);
}

function selectListingPhotoUrls(storedImages: StoredImage[]): string[] {
  const generated = storedImages.filter((image) => image.kind !== "original");
  const shown = generated.length > 0 ? generated : storedImages;

  return shown.slice(0, MAX_LISTING_PHOTOS).map((image) => image.url);
}

export async function loadAgentContext(productId: string): Promise<AgentContext | null> {
  const product = await database.query.products.findFirst({
    where: eq(products.id, productId),
    columns: {
      id: true,
      title: true,
      description: true,
      category: true,
      brand: true,
      model: true,
      condition: true,
      conditionNotes: true,
      attributes: true,
      sellerNotes: true,
      facts: true,
      listPriceInArs: true,
      floorPriceInArs: true,
      status: true,
    },
    with: {
      store: {
        columns: {
          id: true,
          name: true,
          handle: true,
          description: true,
          locationName: true,
          agentName: true,
          agentVoice: true,
          agentOpensNegotiation: true,
          agentContext: true,
          whatsappPhone: true,
          maxCounterOffers: true,
          firstConcessionPercent: true,
          subsequentConcessionPercent: true,
          suspendedAt: true,
        },
      },
      images: { columns: { url: true, kind: true }, orderBy: [asc(images.sortOrder)] },
      questions: { columns: { question: true, answer: true, status: true } },
      comparables: {
        columns: { title: true, priceInArs: true },
        limit: MAX_AGENT_COMPARABLES,
      },
    },
  });

  if (
    product === undefined ||
    product.status !== "published" ||
    product.title === null ||
    product.listPriceInArs === null ||
    product.floorPriceInArs === null ||
    product.store.suspendedAt !== null
  ) {
    return null;
  }

  return {
    product: {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      model: product.model,
      condition: product.condition,
      conditionNotes: product.conditionNotes,
      attributes: product.attributes,
      sellerNotes: product.sellerNotes,
      facts: product.facts,
      listPriceInArs: product.listPriceInArs,
      floorPriceInArs: product.floorPriceInArs,
      photoUrls: selectPhotoUrlsForInspection(product.images),
      listingPhotoUrls: selectListingPhotoUrls(product.images),
    },
    store: {
      id: product.store.id,
      name: product.store.name,
      handle: product.store.handle,
      description: product.store.description,
      locationName: product.store.locationName,
      agentName: product.store.agentName,
      agentVoice: product.store.agentVoice,
      agentOpensNegotiation: product.store.agentOpensNegotiation,
      agentContext: product.store.agentContext,
      whatsappPhone: product.store.whatsappPhone,
      settings: {
        maxCounterOffers: product.store.maxCounterOffers,
        firstConcessionPercent: product.store.firstConcessionPercent,
        subsequentConcessionPercent: product.store.subsequentConcessionPercent,
      },
    },
    questions: product.questions,
    comparables: product.comparables,
  };
}
