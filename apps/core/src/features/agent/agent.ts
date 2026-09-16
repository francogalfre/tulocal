import { convertToModelMessages, isStepCount, streamText } from "ai";
import type { AsyncIterableStream, InferUIMessageChunk, InferUITools, UIMessage } from "ai";

import type { AgentComparable, AgentContext, AgentProduct } from "@/features/agent/context";
import { envelopeBuyerMessages } from "@/features/agent/prompt/envelope";
import { buildAgentInstructions } from "@/features/agent/prompt/instructions";
import type { PromptProduct } from "@/features/agent/prompt/knowledge";
import { agentTools } from "@/features/agent/tools/toolset";
import { agentModel } from "@/features/product/pipeline/models";

const MAX_STEPS = 6;

export type ShownOffer = {
  priceInArs: number;
  priceLabel: string;
  isFinal: boolean;
};

export type AgentDataParts = {
  correction: { text: string };
  photos: { photoUrls: string[] };
  offer: ShownOffer;
};

export type AgentUIMessage = UIMessage<never, AgentDataParts, InferUITools<typeof agentTools>>;

export type AgentChunk = InferUIMessageChunk<AgentUIMessage>;

export type AgentTurnInput = {
  conversationId: string;
  context: AgentContext;
  lastCounterOfferInArs: number | null;
  history: AgentUIMessage[];
};

function stripPrivateProductFields(product: AgentProduct): PromptProduct {
  return {
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
  };
}

function selectComparablesAboveFloor(
  comparables: AgentComparable[],
  floorPriceInArs: number,
): AgentComparable[] {
  return comparables.filter((comparable) => comparable.priceInArs > floorPriceInArs);
}

function hasAgentReplied(history: AgentUIMessage[]): boolean {
  return history.some((message) => message.role === "assistant");
}

export async function streamAgentTurn(
  input: AgentTurnInput,
): Promise<AsyncIterableStream<AgentChunk>> {
  const { conversationId, context, lastCounterOfferInArs, history } = input;
  const { product, store } = context;
  const comparablesAboveFloor = selectComparablesAboveFloor(
    context.comparables,
    product.floorPriceInArs,
  );
  const result = streamText({
    model: agentModel,
    system: buildAgentInstructions({
      product: stripPrivateProductFields(product),
      store,
      photoCount: product.photoUrls.length,
      questions: context.questions,
      comparables: comparablesAboveFloor,
      lastCounterOfferInArs,
      hasAgentReplied: hasAgentReplied(history),
    }),
    messages: await convertToModelMessages(envelopeBuyerMessages(history), { tools: agentTools }),
    tools: agentTools,
    toolsContext: {
      respondToOffer: {
        conversationId,
        productId: product.id,
        storeId: store.id,
        listPriceInArs: product.listPriceInArs,
        floorPriceInArs: product.floorPriceInArs,
        settings: store.settings,
      },
      askSeller: { conversationId, productId: product.id },
      inspectPhotos: {
        productId: product.id,
        productTitle: product.title,
        photoUrls: product.photoUrls,
      },
      showPhotos: {
        realPhotoUrls: product.photoUrls,
        listingPhotoUrls: product.listingPhotoUrls,
      },
      signalBuyIntent: { conversationId, productId: product.id, storeId: store.id },
      flagScam: { conversationId, productId: product.id, storeId: store.id },
    },
    stopWhen: isStepCount(MAX_STEPS),
  });

  return result.toUIMessageStream<AgentUIMessage>();
}
