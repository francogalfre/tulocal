import { convertToModelMessages, isStepCount, streamText } from "ai";
import type { AsyncIterableStream, InferUIMessageChunk, InferUITools, UIMessage } from "ai";

import { buildAgentInstructions } from "@/features/agent/instructions";
import { askSeller } from "@/features/agent/tools/ask";
import { signalBuyIntent } from "@/features/agent/tools/intent";
import { respondToOffer } from "@/features/agent/tools/offer";
import { flagScam } from "@/features/agent/tools/scam";
import type { AgentContext, AgentProduct } from "@/features/agent/context";
import { agentModel } from "@/features/product/pipeline/models";

const MAX_STEPS = 4;

const agentTools = { respondToOffer, askSeller, signalBuyIntent, flagScam };

export type AgentDataParts = {
  correction: { text: string };
};

export type AgentUIMessage = UIMessage<never, AgentDataParts, InferUITools<typeof agentTools>>;

export type AgentChunk = InferUIMessageChunk<AgentUIMessage>;

export type AgentTurnInput = {
  conversationId: string;
  context: AgentContext;
  lastCounterOfferInArs: number | null;
  history: AgentUIMessage[];
};

function stripFloorPrice(product: AgentProduct): Omit<AgentProduct, "floorPriceInArs"> {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    brand: product.brand,
    model: product.model,
    condition: product.condition,
    conditionNotes: product.conditionNotes,
    attributes: product.attributes,
    sellerNotes: product.sellerNotes,
    listPriceInArs: product.listPriceInArs,
  };
}

export async function streamAgentTurn(
  input: AgentTurnInput,
): Promise<AsyncIterableStream<AgentChunk>> {
  const { conversationId, context, lastCounterOfferInArs } = input;
  const { product, store } = context;
  const result = streamText({
    model: agentModel,
    system: buildAgentInstructions({
      product: stripFloorPrice(product),
      store,
      questions: context.questions,
      lastCounterOfferInArs,
    }),
    messages: await convertToModelMessages(input.history, { tools: agentTools }),
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
      signalBuyIntent: { conversationId, productId: product.id, storeId: store.id },
      flagScam: { conversationId, productId: product.id, storeId: store.id },
    },
    stopWhen: isStepCount(MAX_STEPS),
  });

  return result.toUIMessageStream<AgentUIMessage>();
}
