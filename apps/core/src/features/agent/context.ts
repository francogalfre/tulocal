import { eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";

import type { NegotiationSettings } from "@/features/agent/negotiation/move";
import type { ProductCategory } from "@/features/product/category";
import type { ProductCondition } from "@/features/product/condition";

const MAX_AGENT_COMPARABLES = 8;

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
};

export type AgentStore = {
  id: string;
  name: string;
  handle: string;
  agentName: string;
  agentTone: "formal" | "casual" | "terse";
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
          agentName: true,
          agentTone: true,
          agentContext: true,
          whatsappPhone: true,
          maxCounterOffers: true,
          firstConcessionPercent: true,
          subsequentConcessionPercent: true,
        },
      },
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
    product.floorPriceInArs === null
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
    },
    store: {
      id: product.store.id,
      name: product.store.name,
      handle: product.store.handle,
      agentName: product.store.agentName,
      agentTone: product.store.agentTone,
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
