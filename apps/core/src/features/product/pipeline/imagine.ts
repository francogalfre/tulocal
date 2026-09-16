import { generateText } from "ai";

import { imageModel } from "@/features/product/pipeline/models";
import { buildPreservationRules, CAMERA_RULES } from "@/features/product/pipeline/preserve";
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

type Shot = {
  kind: GeneratedImageKind;
  describeScene: (identification: Identification) => string;
};

const SHOTS: Shot[] = [
  {
    kind: "primary",
    describeScene: () =>
      "Cut the product out and place it on a seamless pure white studio sweep, like a professional e-commerce catalog photo. Large soft box lighting from the upper left, a faint natural contact shadow under the product, a subtle soft reflection only if the surface would produce one. Product centered and fully in frame, same camera angle as the source.",
  },
  {
    kind: "contextual",
    describeScene: (identification) =>
      `Place the product in a real, lived-in place where a ${identification.genericQuery} is normally found or used in an Argentine home or street. Late afternoon window light or open shade, realistic cast shadows that match the light direction, the product resting naturally on a real surface. Shallow depth of field, background softly out of focus, nothing touching or overlapping the product. The scene complements the product's ${identification.dominantColor} color and looks like a candid photo, not a render.`,
  },
  {
    kind: "contextual",
    describeScene: (identification) =>
      `Photograph the product on a simple textured surface (linen, raw wood, concrete or paper) with a plain wall behind, in a muted tone that complements its ${identification.dominantColor} color. Soft directional daylight from one side, a clearly visible but soft shadow, slight lens vignette. Editorial product photography look, product fills most of the frame, same angle as the source.`,
  },
];

function buildImagePrompt(shot: Shot, identification: Identification): string {
  return `${buildPreservationRules(identification)}\n${shot.describeScene(identification)}\n${CAMERA_RULES}`;
}

async function generateShot(shot: Shot, input: ImagineInput): Promise<GeneratedImage | null> {
  const { files } = await generateText({
    model: imageModel,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildImagePrompt(shot, input.identification) },
          { type: "image", image: input.source.bytes, mediaType: input.source.mediaType },
        ],
      },
    ],
  });
  const generated = files.find((file) => file.mediaType.startsWith("image/"));

  if (generated === undefined) {
    return null;
  }

  return { kind: shot.kind, bytes: generated.uint8Array, mediaType: generated.mediaType };
}

export async function generateProductImages(input: ImagineInput): Promise<GeneratedImage[]> {
  const generated = await Promise.all(SHOTS.map((shot) => generateShot(shot, input)));

  return generated.filter((image) => image !== null);
}
