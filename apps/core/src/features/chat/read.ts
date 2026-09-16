import type { AgentUIMessage } from "@/features/agent/agent";
import type { ChatNoteKind } from "@/features/chat/note";

export type ChatCard =
  | { kind: "photos"; id: string; photoUrls: string[] }
  | { kind: "offer"; id: string; priceInArs: number; priceLabel: string; isFinal: boolean };

export function readMessageText(message: AgentUIMessage): string {
  const correction = message.parts.find((part) => part.type === "data-correction");

  if (correction !== undefined) {
    return correction.data.text;
  }

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function readNoteKinds(message: AgentUIMessage): ChatNoteKind[] {
  const kinds: ChatNoteKind[] = [];

  for (const part of message.parts) {
    if (part.type === "tool-inspectPhotos" && part.state === "output-available") {
      if (part.output.status === "seen" && !kinds.includes("looked")) {
        kinds.push("looked");
      }
    }

    if (part.type === "tool-askSeller" && part.state === "output-available") {
      kinds.push(part.output.status === "logged" ? "asked" : "waiting");
    }
  }

  return kinds;
}

export function readOfferedPriceInArs(messages: AgentUIMessage[], fallbackInArs: number): number {
  let offeredPriceInArs = fallbackInArs;

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "tool-respondToOffer" && part.state === "output-available") {
        offeredPriceInArs = part.output.priceInArs;
      }

      if (part.type === "data-offer") {
        offeredPriceInArs = part.data.priceInArs;
      }
    }
  }

  return offeredPriceInArs;
}

export function readCards(message: AgentUIMessage): ChatCard[] {
  const cards: ChatCard[] = [];

  for (const part of message.parts) {
    if (part.type === "data-photos") {
      cards.push({ kind: "photos", id: `${message.id}-photos`, photoUrls: part.data.photoUrls });
    }

    if (part.type === "data-offer") {
      cards.push({
        kind: "offer",
        id: `${message.id}-offer`,
        priceInArs: part.data.priceInArs,
        priceLabel: part.data.priceLabel,
        isFinal: part.data.isFinal,
      });
    }

    if (part.type === "tool-showPhotos" && part.state === "output-available") {
      cards.push({ kind: "photos", id: part.toolCallId, photoUrls: part.output.photoUrls });
    }

    if (
      part.type === "tool-respondToOffer" &&
      part.state === "output-available" &&
      (part.output.kind === "counter" || part.output.kind === "hold")
    ) {
      cards.push({
        kind: "offer",
        id: part.toolCallId,
        priceInArs: part.output.priceInArs,
        priceLabel: part.output.priceLabel,
        isFinal: part.output.isFinal,
      });
    }
  }

  return cards;
}
