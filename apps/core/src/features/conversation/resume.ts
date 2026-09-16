import type { AgentUIMessage } from "@/features/agent/agent";
import { EMPTY_CLOSING, findConversationClosing } from "@/features/conversation/closing";
import type { ConversationClosing } from "@/features/conversation/closing";
import { findConversationByToken } from "@/features/conversation/find";
import { loadConversationMessages } from "@/features/conversation/messages";
import { readBuyerToken } from "@/features/conversation/token";

export type ResumedConversation = {
  messages: AgentUIMessage[];
  closing: ConversationClosing;
};

const EMPTY_CONVERSATION: ResumedConversation = { messages: [], closing: EMPTY_CLOSING };

export async function resumeConversation(productId: string): Promise<ResumedConversation> {
  const buyerToken = await readBuyerToken();

  if (buyerToken === null) {
    return EMPTY_CONVERSATION;
  }

  const conversation = await findConversationByToken(productId, buyerToken);

  if (conversation === null) {
    return EMPTY_CONVERSATION;
  }

  const [messages, closing] = await Promise.all([
    loadConversationMessages(conversation.id),
    findConversationClosing(conversation.id),
  ]);

  return { messages, closing };
}
