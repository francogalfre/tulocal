"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ChatStatus } from "ai";
import { Sprout } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

import type { AgentUIMessage } from "@/features/agent/agent";
import { Asked } from "@/features/chat/asked";
import { Bubble } from "@/features/chat/bubble";
import { Closing } from "@/features/chat/closing";
import { Composer } from "@/features/chat/composer";
import { Thinking } from "@/features/chat/thinking";
import type { ConversationClosing } from "@/features/conversation/closing";
import { cn } from "@/lib/utils";

type ChatProps = {
  productId: string;
  productTitle: string;
  agentName: string;
  whatsappPhone: string | null;
  initialMessages: AgentUIMessage[];
  initialClosing: ConversationClosing;
  isFullHeight?: boolean;
};

const CHAT_API_PATH = "/api/chat";

function readMessageText(message: AgentUIMessage): string {
  const correction = message.parts.find((part) => part.type === "data-correction");

  if (correction !== undefined) {
    return correction.data.text;
  }

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function readAskedStatus(message: AgentUIMessage): "logged" | "pending" | null {
  for (const part of message.parts) {
    if (part.type === "tool-askSeller" && part.state === "output-available") {
      return part.output.status;
    }
  }

  return null;
}

function isReplyPending(status: ChatStatus, messages: AgentUIMessage[]): boolean {
  if (status === "submitted") {
    return true;
  }

  if (status !== "streaming") {
    return false;
  }

  const lastMessage = messages.at(-1);

  return (
    lastMessage === undefined ||
    lastMessage.role !== "assistant" ||
    readMessageText(lastMessage) === ""
  );
}

function deriveClosing(
  messages: AgentUIMessage[],
  initialClosing: ConversationClosing,
): ConversationClosing {
  let closing = initialClosing;

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "tool-respondToOffer" && part.state === "output-available") {
        if (part.output.kind === "accept") {
          closing = { ...closing, hasBuyIntent: true, agreedPriceInArs: part.output.priceInArs };
        }
      }

      if (part.type === "tool-signalBuyIntent" && part.state === "output-available") {
        closing = { ...closing, hasBuyIntent: true };
      }

      if (part.type === "tool-flagScam" && part.state === "output-available") {
        closing = { ...closing, isScamSuspected: true };
      }
    }
  }

  return closing;
}

export function Chat({
  productId,
  productTitle,
  agentName,
  whatsappPhone,
  initialMessages,
  initialClosing,
  isFullHeight = false,
}: ChatProps) {
  const { messages, sendMessage, status } = useChat<AgentUIMessage>({
    id: productId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: CHAT_API_PATH,
      prepareSendMessagesRequest: ({ messages: pending }) => ({
        body: { productId, message: pending.at(-1) },
      }),
    }),
  });
  const listRef = useRef<HTMLDivElement>(null);
  const isWaiting = isReplyPending(status, messages);
  const closing = deriveClosing(messages, initialClosing);
  const canCloseOnWhatsapp = closing.hasBuyIntent && whatsappPhone !== null;

  useEffect(() => {
    const list = listRef.current;

    if (list !== null) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isWaiting]);

  return (
    <section
      className={cn("flex flex-col gap-4", isFullHeight ? "min-h-0 flex-1" : "")}
      aria-label={`Chat con ${agentName}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sprout className="size-5 text-brand-deep" aria-hidden="true" />
        <span>{agentName}</span>
        <span className="text-muted-foreground">· atiende {productTitle}</span>
      </div>
      <div
        ref={listRef}
        className={cn(
          "relative flex flex-col gap-2 overflow-y-auto",
          isFullHeight ? "min-h-0 flex-1" : "max-h-96",
        )}
      >
        {messages.length === 0 ? (
          <p className="text-muted-foreground">Preguntale lo que quieras o hacele una oferta.</p>
        ) : null}
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message) => {
            const text = readMessageText(message);

            if (text === "") {
              return null;
            }

            const askedStatus = readAskedStatus(message);

            return [
              <Bubble
                key={message.id}
                role={message.role === "user" ? "user" : "assistant"}
                text={text}
              />,
              askedStatus !== null ? (
                <Asked key={`${message.id}-asked`} status={askedStatus} />
              ) : null,
            ];
          })}
          {isWaiting ? <Thinking key="thinking" agentName={agentName} /> : null}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {canCloseOnWhatsapp ? (
          <Closing
            key="closing"
            productId={productId}
            closing={closing}
            agentName={agentName}
            productTitle={productTitle}
            whatsappPhone={whatsappPhone}
          />
        ) : null}
      </AnimatePresence>
      <Composer isReady={status === "ready"} onSend={(text) => sendMessage({ text })} />
    </section>
  );
}
