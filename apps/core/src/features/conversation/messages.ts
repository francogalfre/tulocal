import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";
import { messages } from "@tulocal/database/schema/messages";

import type { AgentUIMessage } from "@/features/agent/agent";

export type ConversationEntry = {
  role: "buyer" | "agent";
  content: string;
};

type StoredMessage = Pick<typeof messages.$inferSelect, "id" | "role" | "content">;

const UI_ROLES = {
  buyer: "user",
  agent: "assistant",
} as const;

function buildUIMessage(stored: StoredMessage): AgentUIMessage {
  return {
    id: stored.id,
    role: UI_ROLES[stored.role],
    parts: [{ type: "text", text: stored.content }],
  };
}

export async function loadConversationMessages(conversationId: string): Promise<AgentUIMessage[]> {
  const rows = await database.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
  });

  return rows.map(buildUIMessage);
}

export async function appendConversationMessage(
  conversationId: string,
  entry: ConversationEntry,
): Promise<AgentUIMessage> {
  const [insertedRows] = await database.batch([
    database
      .insert(messages)
      .values({ conversationId, role: entry.role, content: entry.content })
      .returning({ id: messages.id, role: messages.role, content: messages.content }),
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
