import type { AgentUIMessage } from "@/features/agent/agent";
import { BUYER_MESSAGE_TAG } from "@/features/agent/prompt/guardrails";

function neutralizeTagBrackets(text: string): string {
  return text.replaceAll("<", "‹").replaceAll(">", "›");
}

function envelopeBuyerText(text: string): string {
  return `<${BUYER_MESSAGE_TAG}>\n${neutralizeTagBrackets(text)}\n</${BUYER_MESSAGE_TAG}>`;
}

export function envelopeBuyerMessages(history: AgentUIMessage[]): AgentUIMessage[] {
  return history.map((message) => {
    if (message.role !== "user") {
      return message;
    }

    return {
      ...message,
      parts: message.parts.map((part) =>
        part.type === "text" ? { ...part, text: envelopeBuyerText(part.text) } : part,
      ),
    };
  });
}
