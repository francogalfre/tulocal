import { generateText } from "ai";

import { imageModel } from "@/features/product/pipeline/models";
import type { Identification } from "@/features/product/pipeline/identify";
import type { Photo } from "@/features/product/pipeline/photos";

export type GeneratedImageKind = "primary" | "contextual";

export type GeneratedImage = Photo & {
  kind: GeneratedImageKind;
};

export type ImagineInput = {
  source: Photo;
  identification: Identification;
};

function buildPreservationRules(identification: Identification): string {
  const defects =
    identification.conditionNotes.length === 0
      ? "none listed"
      : identification.conditionNotes.join("; ");

  return `Edit this real photo of a product for an online listing. The product must stay exactly as photographed: same shape, proportions, colors, materials, textures, logos, printed text, buttons, cables and accessories. Do not repair, clean, recolor, resize, duplicate or straighten any part of it. Do not add or remove anything. Do not invent detail that is not in the photo. These visible defects must remain visible and unaltered: ${defects}. The only allowed change is described next.`;
}

const KIND_INSTRUCTIONS = {
  primary:
    "Replace the background with a seamless pure white studio backdrop. Soft even lighting with a subtle contact shadow under the product. Keep the same camera angle and crop, product centered and fully in frame. This is the first photo a buyer sees.",
  contextual: (identification: Identification) =>
    `Place the product, unchanged, in a tidy real-world setting where a ${identification.category} is normally used. Natural daylight, shallow depth of field so the background stays soft. Nothing touches or overlaps the product. The setting complements its ${identification.dominantColor} color without competing with it.`,
};

function buildImagePrompt(kind: GeneratedImageKind, identification: Identification): string {
  const instruction =
    kind === "primary" ? KIND_INSTRUCTIONS.primary : KIND_INSTRUCTIONS.contextual(identification);

  return `${buildPreservationRules(identification)}\n${instruction}`;
}

async function generateImage(
  kind: GeneratedImageKind,
  input: ImagineInput,
): Promise<GeneratedImage | null> {
  const { files } = await generateText({
    model: imageModel,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildImagePrompt(kind, input.identification) },
          { type: "image", image: input.source.bytes, mediaType: input.source.mediaType },
        ],
      },
    ],
  });
  const generated = files.find((file) => file.mediaType.startsWith("image/"));

  if (generated === undefined) {
    return null;
  }

  return { kind, bytes: generated.uint8Array, mediaType: generated.mediaType };
}

export async function generateProductImages(input: ImagineInput): Promise<GeneratedImage[]> {
  const generated = await Promise.all([
    generateImage("primary", input),
    generateImage("contextual", input),
  ]);

  return generated.filter((image) => image !== null);
}
