import { generateText, Output } from "ai";
import { z } from "zod";

import { productCategory, productCondition } from "@tulocal/database/schema/products";

import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import { visionModel } from "@/features/product/pipeline/models";
import type { ProductCategory } from "@/features/product/category";
import type { ProductCondition } from "@/features/product/condition";
import type { Photo } from "@/features/product/pipeline/photos";

const CONDITION_RUBRIC: Record<ProductCondition, string> = {
  new: "sealed, with tags, or clearly never used",
  like_new: "used but without a single visible mark",
  good: "works and looks fine, with light wear from normal use",
  worn: "visible scratches, stains, dents, missing parts or repairs",
};

const IDENTIFICATION_PROMPT = `You are identifying a product photographed by a seller in Argentina so it can be listed online.

Describe only what is visible or certain from the photos. Never invent a brand, a model, a spec, an accessory or a measurement that is not clearly visible. When in doubt, leave it out.

Condition has four levels: ${describeConditionRubric()}. When conditionNotes lists any defect, the level is "good" or "worn", never "new" or "like_new".

List every visible defect in conditionNotes. This list is used to make sure enhanced photos never hide a real flaw.`;

const identificationSchema = z.object({
  category: z
    .enum(productCategory.enumValues)
    .describe(`The one category that fits best: ${describeCategories()}.`),
  brand: z.string().nullable().describe("Brand only if clearly visible."),
  model: z.string().nullable().describe("Model only if clearly visible."),
  condition: z.enum(productCondition.enumValues).describe(describeConditionRubric()),
  conditionNotes: z
    .array(z.string())
    .describe(
      "Every visible scratch, stain, wear mark or missing part, in Spanish. Empty if none.",
    ),
  attributes: z
    .array(z.string())
    .describe(
      "Visible facts as 'clave: valor' in Spanish, e.g. 'color: negro', 'material: madera'.",
    ),
  dominantColor: z.string().describe("Dominant color of the product in Spanish, one or two words."),
  searchQuery: z
    .string()
    .describe(
      "Two to five words an Argentine would type on Mercado Libre to find this exact product: the kind of product plus brand, model, character or key spec. Argentine vocabulary (remera, buzo, zapatillas, celular, heladera, notebook). No colors, patterns, sizes or condition words. E.g. 'remera hello kitty', 'samsung galaxy a54 128gb', 'bicicleta rodado 29'.",
    ),
  genericQuery: z
    .string()
    .describe(
      "Two to four words for the kind of product with its one key spec, without brand, model, color or pattern, in Argentine Spanish, e.g. 'remera mujer', 'bicicleta mountain bike rodado 29', 'silla de madera'.",
    ),
  bestPhotoIndex: z
    .number()
    .int()
    .describe("Zero-based index of the clearest photo where the whole product is visible."),
});

export type Identification = z.infer<typeof identificationSchema>;

function describeCategories(): string {
  return productCategory.enumValues
    .map((category: ProductCategory) => `${category} (${CATEGORY_LABELS[category]})`)
    .join(", ");
}

function describeConditionRubric(): string {
  return productCondition.enumValues
    .map(
      (condition: ProductCondition) =>
        `"${condition}" (${CONDITION_LABELS[condition]}): ${CONDITION_RUBRIC[condition]}`,
    )
    .join("; ");
}

export async function identifyProduct(photos: Photo[]): Promise<Identification> {
  const { output } = await generateText({
    model: visionModel,
    output: Output.object({ schema: identificationSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: IDENTIFICATION_PROMPT },
          ...photos.map((photo) => ({
            type: "image" as const,
            image: photo.bytes,
            mediaType: photo.mediaType,
          })),
        ],
      },
    ],
  });

  return output;
}
