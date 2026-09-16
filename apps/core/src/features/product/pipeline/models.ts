import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { serverEnvironment } from "@tulocal/environment/server";

const VISION_MODEL_ID = "google/gemini-3.8-flash";

const FAST_MODEL_ID = "google/gemini-3.5-flash-lite";

const IMAGE_MODEL_ID = "google/gemini-3.1-flash-image";

const AGENT_MODEL_ID = "google/gemini-3.5-flash-lite";

const RESEARCH_MODEL_ID = "google/gemini-3.8-flash";

const openrouter = createOpenRouter({ apiKey: serverEnvironment.OPENROUTER_API_KEY });

export const visionModel = openrouter.chat(VISION_MODEL_ID);

export const fastModel = openrouter.chat(FAST_MODEL_ID);

export const imageModel = openrouter.chat(IMAGE_MODEL_ID, {
  extraBody: { modalities: ["image", "text"] },
});

export const agentModel = openrouter.chat(AGENT_MODEL_ID);

export const researchModel = openrouter.chat(RESEARCH_MODEL_ID, {
  reasoning: { effort: "low" },
});
