"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ChatStatus } from "ai";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

import type { AgentUIMessage } from "@/features/agent/agent";
import { AgentFace } from "@/features/agent/face";
import type { AgentVoice } from "@/features/agent/voice";
import { Closing } from "@/features/chat/closing";
import { Composer } from "@/features/chat/composer";
import { renderEntry } from "@/features/chat/entry";
import { Price } from "@/features/chat/price";
import { readMessageText, readOfferedPriceInArs } from "@/features/chat/read";
import { Thinking } from "@/features/chat/thinking";
import { Welcome } from "@/features/chat/welcome";
import type { ConversationClosing } from "@/features/conversation/closing";
import { cn } from "@/lib/utils";

type ChatProps = {
  productId: string;
  productTitle: string;
  listPriceInArs: number;
  agentName: string;
  agentSeed: string;
  agentVoice: AgentVoice;
  whatsappPhone: string | null;
  initialMessages: AgentUIMessage[];
  initialClosing: ConversationClosing;
  isFullHeight?: boolean;
};

const CHAT_API_PATH = "/api/chat";

const HEADER_FACE_SIZE_IN_PIXELS = 48;

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
  listPriceInArs,
  agentName,
  agentSeed,
  agentVoice,
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
  const hasScrolledOnceRef = useRef(false);
  const isWaiting = isReplyPending(status, messages);
  const closing = deriveClosing(messages, initialClosing);
  const canCloseOnWhatsapp = closing.hasBuyIntent && whatsappPhone !== null;
  const canAcceptOffer = status === "ready" && !closing.hasBuyIntent;
  const agent = { name: agentName, seed: agentSeed, voice: agentVoice };
  const offeredPriceInArs = readOfferedPriceInArs(
    messages,
    closing.agreedPriceInArs ?? listPriceInArs,
  );

  function send(text: string): void {
    void sendMessage({ text });
  }

  useEffect(() => {
    const list = listRef.current;

    if (list !== null) {
      list.scrollTo({
        top: list.scrollHeight,
        behavior: hasScrolledOnceRef.current ? "smooth" : "instant",
      });
      hasScrolledOnceRef.current = true;
    }
  }, [messages, isWaiting]);

  return (
    <section
      className={cn("flex flex-col gap-5", isFullHeight ? "min-h-0 flex-1" : "")}
      aria-label={`Chat con ${agentName}`}
    >
      <header className="flex items-center gap-3 border-b border-border pb-4">
        <AgentFace
          seed={agentSeed}
          voice={agentVoice}
          name={agentName}
          sizeInPixels={HEADER_FACE_SIZE_IN_PIXELS}
          isThinking={isWaiting}
          animate="always"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="font-heading text-lg font-semibold">{agentName}</p>
          <p className="max-w-3xs truncate text-[13px] font-medium text-muted-foreground sm:max-w-xs">
            {isWaiting ? "Escribiendo" : `Te atiende por ${productTitle}`}
          </p>
        </div>
        <Price listPriceInArs={listPriceInArs} offeredPriceInArs={offeredPriceInArs} />
      </header>
      <div
        ref={listRef}
        className={cn(
          "relative flex flex-col gap-5 overflow-y-auto",
          isFullHeight ? "min-h-0 flex-1" : "max-h-96",
        )}
      >
        {messages.length === 0 ? (
          <Welcome
            agentName={agentName}
            agentSeed={agentSeed}
            agentVoice={agentVoice}
            isReady={status === "ready"}
            onSuggest={send}
          />
        ) : null}
        <AnimatePresence initial={false} mode="popLayout">
          {messages.flatMap((message, index) =>
            renderEntry({
              message,
              agent,
              canAcceptOffer: canAcceptOffer && index === messages.length - 1,
              onSend: send,
            }),
          )}
          {isWaiting ? (
            <Thinking
              key="thinking"
              agentName={agentName}
              agentSeed={agentSeed}
              agentVoice={agentVoice}
            />
          ) : null}
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
      <Composer isReady={status === "ready"} onSend={send} />
    </section>
  );
}
