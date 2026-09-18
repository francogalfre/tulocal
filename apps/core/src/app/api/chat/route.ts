import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { UIMessageStreamWriter } from "ai";
import { after } from "next/server";
import { z } from "zod";

import { streamAgentTurn } from "@/features/agent/agent";
import { loadAgentContext } from "@/features/agent/context";
import { shownPhotosOutputSchema } from "@/features/agent/tools/album";
import { negotiationMoveOutputSchema } from "@/features/agent/tools/offer";
import { buildFallbackReply, isReplySafe } from "@/features/agent/validation/reply";
import type { AgentChunk, AgentUIMessage, ShownOffer } from "@/features/agent/agent";
import type { NegotiationMoveOutput } from "@/features/agent/tools/offer";
import { createConversation, findConversationByToken } from "@/features/conversation/find";
import {
  appendConversationMessage,
  loadConversationMessages,
} from "@/features/conversation/messages";
import { ensureBuyerToken } from "@/features/conversation/token";
import { isAgentMessageLimitReached } from "@/features/plan/limits/usage";
import { logEvent } from "@/lib/logger";

export const maxDuration = 60;

const MESSAGE_MAX_LENGTH = 1000;

const OFFER_TOOL_NAME = "respondToOffer";

const PHOTOS_TOOL_NAME = "showPhotos";

const bodySchema = z.object({
  productId: z.uuid(),
  message: z.object({
    parts: z
      .array(
        z.object({
          type: z.literal("text"),
          text: z.string().trim().min(1).max(MESSAGE_MAX_LENGTH),
        }),
      )
      .min(1),
  }),
});

type AgentTurn = {
  text: string;
  lastMove: NegotiationMoveOutput | null;
  photoUrls: string[];
};

type SettleTurnInput = {
  stream: ReadableStream<AgentChunk>;
  conversationId: string;
  productId: string;
  floorPriceInArs: number;
};

type ResolvedReply = {
  text: string;
  wasReplaced: boolean;
};

async function collectAgentTurn(stream: ReadableStream<AgentChunk>): Promise<AgentTurn> {
  const toolNamesByCallId = new Map<string, string>();
  let text = "";
  let lastMove: NegotiationMoveOutput | null = null;
  const photoUrls: string[] = [];

  for await (const chunk of stream) {
    if (chunk.type === "text-delta") {
      text += chunk.delta;
    }

    if (chunk.type === "tool-input-available") {
      toolNamesByCallId.set(chunk.toolCallId, chunk.toolName);
    }

    if (chunk.type !== "tool-output-available") {
      continue;
    }

    const toolName = toolNamesByCallId.get(chunk.toolCallId);

    if (toolName === OFFER_TOOL_NAME) {
      lastMove = negotiationMoveOutputSchema.parse(chunk.output);
    }

    if (toolName === PHOTOS_TOOL_NAME) {
      photoUrls.push(...shownPhotosOutputSchema.parse(chunk.output).photoUrls);
    }
  }

  return { text, lastMove, photoUrls };
}

function resolveReply(turn: AgentTurn, floorPriceInArs: number): ResolvedReply {
  const isSafe = isReplySafe({
    text: turn.text,
    floorPriceInArs,
    isFloorMentionAllowed: turn.lastMove?.priceInArs === floorPriceInArs,
  });

  if (isSafe) {
    return { text: turn.text, wasReplaced: false };
  }

  return { text: buildFallbackReply(turn.lastMove), wasReplaced: true };
}

function selectShownOffer(lastMove: NegotiationMoveOutput | null): ShownOffer | null {
  if (lastMove === null || (lastMove.kind !== "counter" && lastMove.kind !== "hold")) {
    return null;
  }

  return {
    priceInArs: lastMove.priceInArs,
    priceLabel: lastMove.priceLabel,
    isFinal: lastMove.isFinal,
  };
}

async function settleTurn(input: SettleTurnInput): Promise<ResolvedReply> {
  const turn = await collectAgentTurn(input.stream);
  const reply = resolveReply(turn, input.floorPriceInArs);

  if (reply.wasReplaced) {
    logEvent({ event: "agent.reply.rejected", productId: input.productId });
  }

  const offer = selectShownOffer(turn.lastMove);
  const hasSomethingToShow = reply.text !== "" || turn.photoUrls.length > 0 || offer !== null;

  if (hasSomethingToShow) {
    await appendConversationMessage(input.conversationId, {
      role: "agent",
      content: reply.text,
      photoUrls: turn.photoUrls,
      offer,
    });
  }

  return reply;
}

async function relayAgentStream(
  stream: ReadableStream<AgentChunk>,
  writer: UIMessageStreamWriter<AgentUIMessage>,
): Promise<AgentChunk | null> {
  let finishChunk: AgentChunk | null = null;

  for await (const chunk of stream) {
    if (chunk.type === "finish") {
      finishChunk = chunk;
      continue;
    }

    writer.write(chunk);
  }

  return finishChunk;
}

export async function POST(request: Request): Promise<Response> {
  const body = bodySchema.safeParse(await request.json());

  if (!body.success) {
    return Response.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const buyerToken = await ensureBuyerToken();
  const [context, existingConversation] = await Promise.all([
    loadAgentContext(body.data.productId),
    findConversationByToken(body.data.productId, buyerToken),
  ]);

  if (context === null) {
    return Response.json({ error: "Producto no disponible" }, { status: 404 });
  }

  if (await isAgentMessageLimitReached(context.store.id)) {
    logEvent({ event: "agent.limit.reached", storeId: context.store.id });
    return Response.json({ error: "El agente no está disponible" }, { status: 429 });
  }

  const conversation =
    existingConversation === null
      ? await createConversation({
          productId: context.product.id,
          storeId: context.store.id,
          buyerToken,
        })
      : existingConversation;
  const buyerText = body.data.message.parts.map((part) => part.text).join("\n");
  const [history, buyerMessage] = await Promise.all([
    loadConversationMessages(conversation.id),
    appendConversationMessage(conversation.id, {
      role: "buyer",
      content: buyerText,
      photoUrls: [],
      offer: null,
    }),
  ]);
  const agentStream = await streamAgentTurn({
    conversationId: conversation.id,
    context,
    lastCounterOfferInArs: conversation.lastCounterOfferInArs,
    history: [...history, buyerMessage],
  });
  const [clientBranch, serverBranch] = agentStream.tee();
  const settled = settleTurn({
    stream: serverBranch,
    conversationId: conversation.id,
    productId: context.product.id,
    floorPriceInArs: context.product.floorPriceInArs,
  });

  after(() => settled);

  const stream = createUIMessageStream<AgentUIMessage>({
    execute: async ({ writer }) => {
      const finishChunk = await relayAgentStream(clientBranch, writer);
      const reply = await settled;

      if (reply.wasReplaced) {
        writer.write({ type: "data-correction", data: { text: reply.text } });
      }

      if (finishChunk !== null) {
        writer.write(finishChunk);
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
