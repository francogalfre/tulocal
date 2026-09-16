import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { serverEnvironment } from "@tulocal/environment/server";

const VISION_MODEL_ID = "google/gemini-3.8-flash";

const IMAGE_MODEL_ID = "google/gemini-3.1-flash-image";

const openrouter = createOpenRouter({ apiKey: serverEnvironment.OPENROUTER_API_KEY });

export const visionModel = openrouter.chat(VISION_MODEL_ID);

export const imageModel = openrouter.chat(IMAGE_MODEL_ID, {
  extraBody: { modalities: ["image", "text"] },
});
