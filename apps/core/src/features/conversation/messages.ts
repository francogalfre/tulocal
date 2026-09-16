import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";
import { messages } from "@tulocal/database/schema/messages";

import type { AgentUIMessage, ShownOffer } from "@/features/agent/agent";
import { formatArs } from "@/lib/money";

export type ConversationEntry = {
  role: "buyer" | "agent";
  content: string;
  photoUrls: string[];
  offer: ShownOffer | null;
};

type StoredMessage = Pick<
  typeof messages.$inferSelect,
  "id" | "role" | "content" | "photoUrls" | "offerPriceInArs" | "isFinalOffer"
>;

type AgentMessagePart = AgentUIMessage["parts"][number];

const STORED_MESSAGE_COLUMNS = {
  id: messages.id,
  role: messages.role,
  content: messages.content,
  photoUrls: messages.photoUrls,
  offerPriceInArs: messages.offerPriceInArs,
  isFinalOffer: messages.isFinalOffer,
};

const UI_ROLES = {
  buyer: "user",
  agent: "assistant",
} as const;

function buildMessageParts(stored: StoredMessage): AgentMessagePart[] {
  const parts: AgentMessagePart[] = [{ type: "text", text: stored.content }];

  if (stored.photoUrls.length > 0) {
    parts.push({ type: "data-photos", data: { photoUrls: stored.photoUrls } });
  }

  if (stored.offerPriceInArs !== null) {
    parts.push({
      type: "data-offer",
      data: {
        priceInArs: stored.offerPriceInArs,
        priceLabel: formatArs(stored.offerPriceInArs),
        isFinal: stored.isFinalOffer,
      },
    });
  }

  return parts;
}

function buildUIMessage(stored: StoredMessage): AgentUIMessage {
  return {
    id: stored.id,
    role: UI_ROLES[stored.role],
    parts: buildMessageParts(stored),
  };
}

export async function loadConversationMessages(conversationId: string): Promise<AgentUIMessage[]> {
  const rows = await database
    .select(STORED_MESSAGE_COLUMNS)
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return rows.map(buildUIMessage);
}

export async function appendConversationMessage(
  conversationId: string,
  entry: ConversationEntry,
): Promise<AgentUIMessage> {
  const [insertedRows] = await database.batch([
    database
      .insert(messages)
      .values({
        conversationId,
        role: entry.role,
        content: entry.content,
        photoUrls: entry.photoUrls,
        offerPriceInArs: entry.offer === null ? null : entry.offer.priceInArs,
        isFinalOffer: entry.offer === null ? false : entry.offer.isFinal,
      })
      .returning(STORED_MESSAGE_COLUMNS),
    database
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId)),
  ]);
  const inserted = insertedRows[0];

  if (inserted === undefined) {
    throw new Error("No se pudo guardar el mensaje");
  }

  return buildUIMessage(inserted);
}
