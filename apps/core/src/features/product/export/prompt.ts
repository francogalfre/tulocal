import { CATEGORY_LABELS } from "@/features/product/category";
import { buildPreservationRules, CAMERA_RULES } from "@/features/product/pipeline/preserve";
import type { SceneFormat } from "@/features/product/export/formats";
import type { ProductCategory } from "@/features/product/category";

export type ScenePromptInput = {
  format: SceneFormat;
  category: ProductCategory | null;
  brand: string | null;
  model: string | null;
  attributes: string[];
  conditionNotes: string[];
};

const GENERIC_SUBJECT = "a product";

function describeSubject(input: ScenePromptInput): string {
  const categoryLabel =
    input.category === null ? GENERIC_SUBJECT : `a ${CATEGORY_LABELS[input.category]}`;
  const brandAndModel = [input.brand, input.model].filter((part) => part !== null).join(" ");
  const subject = brandAndModel === "" ? categoryLabel : `${categoryLabel} (${brandAndModel})`;

  if (input.attributes.length === 0) {
    return subject;
  }

  return `${subject}, ${input.attributes.join(", ")}`;
}

const SCENE_DESCRIPTIONS: Record<SceneFormat, (subject: string) => string> = {
  story: (subject) =>
    `Vertical 9:16 advertising photograph for an Instagram story of ${subject}. Place the product in a real, lived-in Argentine home or street where it is normally used, with late afternoon window light or open shade, realistic cast shadows and shallow depth of field. The product sits in the middle third of the frame and takes about half of the frame height. The top quarter and the bottom quarter of the frame stay calm, softly out of focus background with no important detail, because they will be covered by text and interface.`,
  carousel: (subject) =>
    `Square 1:1 advertising photograph for an Instagram carousel of ${subject}. The product is centered and fills about seventy percent of the frame, resting naturally on a real surface in a quiet, slightly out of focus Argentine setting that complements its colors. Nothing touches or overlaps the product.`,
};

export function buildScenePrompt(input: ScenePromptInput): string {
  const scene = SCENE_DESCRIPTIONS[input.format](describeSubject(input));

  return `${buildPreservationRules(input)}\n${scene}\n${CAMERA_RULES}`;
}
