"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import type { NegotiationUIMessage } from "@tulocal/ai";
import { Button } from "@tulocal/ui/components/button";
import { Input } from "@tulocal/ui/components/input";
import { Spinner } from "@tulocal/ui/components/spinner";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatARS } from "@/lib/format";
import { getServerUrl } from "@/lib/server-url";
import { getVisitorId } from "@/lib/visitor-id";
import { trpc } from "@/utils/trpc";

type Deal = { agreedPrice: number; whatsappUrl: string };

function findDeal(messages: NegotiationUIMessage[]): Deal | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    for (const part of messages[i]!.parts) {
      if (part.type === "tool-closeDeal" && part.state === "output-available" && part.output.ok) {
        return { agreedPrice: part.output.agreedPrice, whatsappUrl: part.output.whatsappUrl };
      }
    }
  }
  return null;
}

function ChatThread({
  productId,
  visitorId,
  listPrice,
  initialMessages,
  initialDeal,
}: {
  productId: string;
  visitorId: string;
  listPrice: number;
  initialMessages: NegotiationUIMessage[];
  initialDeal: Deal | null;
}) {
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: `${getServerUrl()}/chat`,
        body: { productId, visitorId },
      }),
  );
  const { messages, sendMessage, status, error } = useChat<NegotiationUIMessage>({
    id: `${productId}:${visitorId}`,
    transport,
    messages: initialMessages,
  });
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, status]);

  const deal = findDeal(messages) ?? initialDeal;
  const busy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  const suggestions = [
    "¿En qué estado está?",
    "¿Qué incluye?",
    `Te ofrezco ${formatARS(Math.round((listPrice * 0.8) / 100) * 100)}`,
  ];

  return (
    <div className="flex flex-col border">
      <div className="border-b px-3 py-2 text-xs font-medium">Chateá con el vendedor virtual</div>
      <div className="flex max-h-[26rem] min-h-56 flex-col gap-2 overflow-y-auto p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-muted-foreground">
            Preguntá lo que quieras sobre el producto o hacé una oferta. Si llegan a un precio,
            seguís por WhatsApp con el vendedor.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-1">
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                if (!part.text) return null;
                return (
                  <div
                    key={index}
                    className={`max-w-[85%] px-3 py-2 whitespace-pre-wrap ${
                      message.role === "user"
                        ? "self-end bg-primary text-primary-foreground"
                        : "self-start bg-muted"
                    }`}
                  >
                    {part.text}
                  </div>
                );
              }
              if (part.type === "tool-evaluateOffer") {
                return (
                  <span key={index} className="self-start text-[11px] text-muted-foreground">
                    {part.state === "output-available" ? "Oferta evaluada" : "Evaluando oferta…"}
                  </span>
                );
              }
              return null;
            })}
          </div>
        ))}
        {status === "submitted" && <Spinner className="size-4 self-start" />}
        {error && <p className="text-xs text-destructive">Hubo un problema. Probá de nuevo.</p>}
        <div ref={endRef} />
      </div>

      {deal ? (
        <div className="flex flex-col gap-2 border-t bg-muted/40 p-3">
          <p className="text-sm">
            Precio acordado: <strong>{formatARS(deal.agreedPrice)}</strong>. Seguí la charla con el
            vendedor.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={deal.whatsappUrl} target="_blank" rel="noreferrer" />}
          >
            <MessageCircle data-icon="inline-start" />
            Continuar en WhatsApp
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 border-t p-3">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((text) => (
                <Button key={text} size="xs" variant="outline" onClick={() => submit(text)}>
                  {text}
                </Button>
              ))}
            </div>
          )}
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit(input);
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribí tu mensaje u oferta…"
              disabled={busy}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Enviar">
              <Send />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

export function ProductChat({ productId, listPrice }: { productId: string; listPrice: number }) {
  const [visitorId, setVisitorId] = useState("");
  useEffect(() => setVisitorId(getVisitorId()), []);

  const { data, isPending } = useQuery({
    ...trpc.conversation.getForVisitor.queryOptions({ productId, visitorId }),
    enabled: visitorId.length > 0,
  });

  if (!visitorId || isPending) {
    return (
      <div className="flex min-h-56 items-center justify-center border">
        <Spinner />
      </div>
    );
  }

  return (
    <ChatThread
      productId={productId}
      visitorId={visitorId}
      listPrice={listPrice}
      initialMessages={(data?.messages ?? []) as NegotiationUIMessage[]}
      initialDeal={
        data?.status === "deal" && data.whatsappUrl && data.agreedPrice
          ? { agreedPrice: data.agreedPrice, whatsappUrl: data.whatsappUrl }
          : null
      }
    />
  );
}
