import { generateText, Output } from "ai";
import { z } from "zod";

import { MODELS } from "./models";

export const analysisSchema = z.object({
  title: z.string().max(80).describe("Título corto de la publicación, en español rioplatense"),
  description: z
    .string()
    .describe("Descripción honesta de 2 a 4 párrafos cortos, en español rioplatense, sin hype"),
  category: z.string().describe("Categoría corta, ej: 'Celulares', 'Bicicletas', 'Muebles'"),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  condition: z.enum(["new", "used"]),
  qualityPercent: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Estado visible: 100 impecable, 85 muy bueno, 70 uso normal, 40 dañado"),
  conditionNotes: z
    .array(z.string())
    .describe("Cada rayón, marca de uso, falta o defecto VISIBLE. Vacío solo si no hay ninguno."),
  attributes: z
    .record(z.string(), z.string())
    .describe(
      "Atributos visibles o deducibles con certeza: color, material, talle, capacidad, etc.",
    ),
  searchQuery: z
    .string()
    .describe(
      "Consulta corta para buscar el mismo producto en MercadoLibre: marca + modelo + spec clave",
    ),
  bestImageIndex: z
    .number()
    .int()
    .describe("Índice (base 0) de la foto más clara donde se ve el producto completo"),
});

export type ProductAnalysis = z.infer<typeof analysisSchema>;

export type ImageInput = { data: Uint8Array; mediaType: string };

const ANALYSIS_PROMPT = `You are listing a product for sale on an Argentine marketplace.
Look at the photos and describe ONLY what is visible or can be stated with certainty. Never invent features, specs, accessories or brands that are not clearly visible.

Output language: Spanish from Argentina (rioplatense, voseo is fine). No marketing hype, no exclamation marks.

- title: short, specific, buyer-search friendly.
- description: honest, useful for a buyer, mention what is included only if visible.
- condition: "new" only if clearly sealed/unused; otherwise "used".
- qualityPercent: visible condition. New/sealed = 100. Used flawless = 95. Light wear = 80-90. Normal wear = 65-79. Visible damage = below 60.
- conditionNotes: list EVERY visible scratch, scuff, dent, stain, missing part or defect. This list is used to guarantee that enhanced images do not hide defects.
- searchQuery: brand + model + key spec, no adjectives, e.g. "iPhone 12 128GB" or "bicicleta rodado 29 Venzo".
- bestImageIndex: photo where the whole product is clearest.`;

export async function analyzeProduct({ images, hint }: { images: ImageInput[]; hint?: string }) {
  const result = await generateText({
    model: MODELS.vision,
    output: Output.object({ schema: analysisSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: hint
              ? `${ANALYSIS_PROMPT}\n\nSeller note (trust it for non-visible facts like storage size or year, but never for condition): "${hint}"`
              : ANALYSIS_PROMPT,
          },
          ...images.map((image) => ({
            type: "image" as const,
            image: image.data,
            mediaType: image.mediaType,
          })),
        ],
      },
    ],
  });
  return result.output;
}
