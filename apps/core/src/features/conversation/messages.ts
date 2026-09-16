import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";
import { messages } from "@tulocal/database/schema/messages";

import type { AgentUIMessage } from "@/features/agent/agent";

export type ConversationEntry = {
  role: "buyer" | "agent";
  content: string;
};

const UI_ROLES = {
  buyer: "user",
  agent: "assistant",
} as const;

export async function loadConversationMessages(conversationId: string): Promise<AgentUIMessage[]> {
  const rows = await database.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
  });

  return rows.map((row) => ({
    id: row.id,
    role: UI_ROLES[row.role],
    parts: [{ type: "text", text: row.content }],
  }));
}

export async function appendConversationMessage(
  conversationId: string,
  entry: ConversationEntry,
): Promise<void> {
  await database.batch([
    database.insert(messages).values({ conversationId, role: entry.role, content: entry.content }),
    database
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId)),
  ]);
}
