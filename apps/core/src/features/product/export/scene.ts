import { generateText } from "ai";

import { EXPORT_FORMATS } from "@/features/product/export/formats";
import { buildScenePrompt } from "@/features/product/export/prompt";
import { imageModel } from "@/features/product/pipeline/models";
import type { ScenePromptInput } from "@/features/product/export/prompt";
import type { Photo } from "@/features/product/pipeline/photos";

export type GenerateSceneInput = {
  source: Photo;
  prompt: ScenePromptInput;
};

export async function generateScene(input: GenerateSceneInput): Promise<Photo | null> {
  const { files } = await generateText({
    model: imageModel,
    providerOptions: {
      openrouter: {
        image_config: { aspect_ratio: EXPORT_FORMATS[input.prompt.format].aspectRatio },
      },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildScenePrompt(input.prompt) },
          { type: "image", image: input.source.bytes, mediaType: input.source.mediaType },
        ],
      },
    ],
  });
  const generated = files.find((file) => file.mediaType.startsWith("image/"));

  if (generated === undefined) {
    return null;
  }

  return { bytes: generated.uint8Array, mediaType: generated.mediaType };
}
