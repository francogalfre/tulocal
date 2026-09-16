import { eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";

export type ConversationClosing = {
  agreedPriceInArs: number | null;
  hasBuyIntent: boolean;
  isScamSuspected: boolean;
};

export const EMPTY_CLOSING: ConversationClosing = {
  agreedPriceInArs: null,
  hasBuyIntent: false,
  isScamSuspected: false,
};

export async function findConversationClosing(
  conversationId: string,
): Promise<ConversationClosing> {
  const conversation = await database.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    columns: { agreedPriceInArs: true },
    with: { escalations: { columns: { kind: true } } },
  });

  if (conversation === undefined) {
    return EMPTY_CLOSING;
  }

  const kinds = conversation.escalations.map((escalation) => escalation.kind);

  return {
    agreedPriceInArs: conversation.agreedPriceInArs,
    hasBuyIntent: kinds.includes("buy_intent"),
    isScamSuspected: kinds.includes("scam_suspected"),
  };
}
