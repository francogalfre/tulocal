import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.APP_URL ?? "https://tulocal.app",
    "X-Title": "tulocal",
  },
});

export const MODEL_IDS = {
  vision: "google/gemini-3.8-flash",
  image: "google/gemini-3.1-flash-image",
  agent: "anthropic/claude-sonnet-5",
} as const;

export const MODELS = {
  vision: openrouter.chat(MODEL_IDS.vision),
  image: openrouter.chat(MODEL_IDS.image, { extraBody: { modalities: ["image", "text"] } }),
  agent: openrouter.chat(MODEL_IDS.agent),
};
