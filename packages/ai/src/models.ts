import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * Models routed through OpenRouter. Keep every model ID here so a swap is a
 * one-line change if an ID is retired. Requires `OPENROUTER_API_KEY`.
 */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.APP_URL ?? "https://tulocal.app",
    "X-Title": "tulocal",
  },
});

export const MODEL_IDS = {
  /** Vision + structured output: product analysis, fidelity checks, price extraction. */
  vision: "google/gemini-3.8-flash",
  /** Image editing with image input (background / lighting / framing only). */
  image: "google/gemini-3.1-flash-image",
  /** Negotiation agent (tool use quality matters here). */
  agent: "anthropic/claude-sonnet-5",
} as const;

export const MODELS = {
  vision: openrouter.chat(MODEL_IDS.vision),
  // OpenRouter only returns images when the request asks for the image modality.
  image: openrouter.chat(MODEL_IDS.image, { extraBody: { modalities: ["image", "text"] } }),
  agent: openrouter.chat(MODEL_IDS.agent),
};
