import { generateText, Output } from "ai";
import { z } from "zod";

import { visionModel } from "@/features/product/pipeline/models";
import type { Photo } from "@/features/product/pipeline/photos";

const identificationSchema = z.object({
  category: z.string().describe("Short category in Spanish, e.g. 'bicicleta', 'celular', 'silla'."),
  brand: z.string().nullable().describe("Brand only if clearly visible."),
  model: z.string().nullable().describe("Model only if clearly visible."),
  condition: z.enum(["new", "used"]),
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
    .describe("Query to find the same product on Mercado Libre Argentina: brand, model, key spec."),
  bestPhotoIndex: z
    .number()
    .int()
    .describe("Zero-based index of the clearest photo where the whole product is visible."),
});

export type Identification = z.infer<typeof identificationSchema>;

const IDENTIFICATION_PROMPT = `You are identifying a product photographed by a seller in Argentina so it can be listed online.

Describe only what is visible or certain from the photos. Never invent a brand, a model, a spec, an accessory or a measurement that is not clearly visible. When in doubt, leave it out.

Condition is "new" only if the product is clearly sealed or unused. Otherwise it is "used".

List every visible defect in conditionNotes. This list is used to make sure enhanced photos never hide a real flaw.`;

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
