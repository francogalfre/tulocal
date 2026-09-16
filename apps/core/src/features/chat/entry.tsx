"use client";

import type { ReactNode } from "react";

import type { AgentUIMessage } from "@/features/agent/agent";
import { AgentFace } from "@/features/agent/face";
import type { AgentVoice } from "@/features/agent/voice";
import { Bubble } from "@/features/chat/bubble";
import { Offer } from "@/features/chat/cards/offer";
import { Photos } from "@/features/chat/cards/photos";
import { Note } from "@/features/chat/note";
import { readCards, readMessageText, readNoteKinds } from "@/features/chat/read";
import type { ChatCard } from "@/features/chat/read";

const MESSAGE_FACE_SIZE_IN_PIXELS = 32;

export type EntryAgent = {
  name: string;
  seed: string;
  voice: AgentVoice;
};

type EntryInput = {
  message: AgentUIMessage;
  agent: EntryAgent;
  listPriceInArs: number;
  canAcceptOffer: boolean;
  isStillStreaming: boolean;
  onSend: (text: string) => void;
};

type CardInput = {
  card: ChatCard;
  listPriceInArs: number;
  canAcceptOffer: boolean;
  onSend: (text: string) => void;
};

function renderCard({ card, listPriceInArs, canAcceptOffer, onSend }: CardInput): ReactNode {
  if (card.kind === "photos") {
    return <Photos key={card.id} photoUrls={card.photoUrls} />;
  }

  return (
    <Offer
      key={card.id}
      listPriceInArs={listPriceInArs}
      priceInArs={card.priceInArs}
      priceLabel={card.priceLabel}
      isFinal={card.isFinal}
      canAccept={canAcceptOffer}
      onAccept={onSend}
    />
  );
}

export function renderEntry({
  message,
  agent,
  listPriceInArs,
  canAcceptOffer,
  isStillStreaming,
  onSend,
}: EntryInput): ReactNode[] {
  const text = readMessageText(message);
  const cards = isStillStreaming ? [] : readCards(message);

  if (text === "" && cards.length === 0) {
    return [];
  }

  const isBuyer = message.role === "user";
  const bubble =
    text === "" ? null : (
      <Bubble
        key={message.id}
        role={isBuyer ? "user" : "assistant"}
        text={text}
        avatar={
          isBuyer ? null : (
            <AgentFace
              seed={agent.seed}
              voice={agent.voice}
              name={agent.name}
              sizeInPixels={MESSAGE_FACE_SIZE_IN_PIXELS}
              isThinking={false}
            />
          )
        }
      />
    );
  const lastCardIndex = cards.length - 1;

  return [
    bubble,
    ...cards.map((card, index) =>
      renderCard({
        card,
        listPriceInArs,
        canAcceptOffer: canAcceptOffer && index === lastCardIndex,
        onSend,
      }),
    ),
    ...readNoteKinds(message).map((kind) => <Note key={`${message.id}-${kind}`} kind={kind} />),
  ];
}
