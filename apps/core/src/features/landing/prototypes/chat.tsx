"use client";

import { cn } from "cn";

import { useHasEnteredViewport } from "@/features/landing/prototypes/viewport";

const AGENT_NAME = "Roque";

type Message = {
  author: "buyer" | "agent";
  text: string;
  delayClassName: string;
};

const CONVERSATION: Message[] = [
  { author: "buyer", text: "¿La dejás en $70.000?", delayClassName: "delay-100" },
  {
    author: "agent",
    text: "No llego a ese número. Por $78.000 te la entrego hoy.",
    delayClassName: "delay-300",
  },
  { author: "buyer", text: "Dale, la llevo", delayClassName: "delay-500" },
];

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1.5 self-start rounded-2xl bg-secondary px-4 py-3.5">
      <span className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce" />
      <span className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce [animation-delay:150ms]" />
      <span className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export function ChatPrototype() {
  const { containerRef, hasEnteredViewport } = useHasEnteredViewport();

  return (
    <div ref={containerRef} className="flex w-full max-w-sm flex-col gap-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
        {AGENT_NAME}, el agente de Martina
      </div>
      {CONVERSATION.map((message) => (
        <p
          key={message.text}
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm transition-all duration-700 ease-out",
            message.delayClassName,
            message.author === "buyer"
              ? "self-end border border-foreground/15"
              : "self-start bg-secondary",
            hasEnteredViewport
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
          )}
        >
          {message.text}
        </p>
      ))}
      <div
        className={cn(
          "transition-opacity duration-700 delay-700",
          hasEnteredViewport ? "opacity-100" : "opacity-0 motion-reduce:opacity-100",
        )}
      >
        <TypingDots />
      </div>
    </div>
  );
}
