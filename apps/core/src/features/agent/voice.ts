import { happy, idle, smug } from "blobatar/expression";
import type { Expression } from "blobatar";

import type { stores } from "@tulocal/database/schema/stores";

export type AgentVoice = (typeof stores.$inferSelect)["agentVoice"];

export const VOICE_LABELS: Record<AgentVoice, string> = {
  cordial: "Cordial",
  playful: "Divertido",
  direct: "Directo",
};

export const VOICE_DESCRIPTIONS: Record<AgentVoice, string> = {
  cordial: "Amable y claro, se toma el tiempo de explicar.",
  playful: "Relajado y con humor, tira algún chiste.",
  direct: "Al grano, la menor cantidad de palabras posible.",
};

export const VOICE_EXPRESSIONS: Record<AgentVoice, Expression> = {
  cordial: happy,
  playful: smug,
  direct: idle,
};
