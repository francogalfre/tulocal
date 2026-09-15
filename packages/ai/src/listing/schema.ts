import { z } from "zod";

export const analysisSchema = z.object({
  title: z.string().max(80).describe("Short listing title. Spanish (Rioplatense)."),
  description: z
    .string()
    .describe("Honest 2-4 short paragraphs. Spanish (Rioplatense), no marketing hype."),
  category: z.string().describe("Short category, e.g. 'Celulares', 'Bicicletas', 'Muebles'."),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  condition: z.enum(["new", "used"]),
  qualityPercent: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Visible condition: 100 flawless, 85 very good, 70 normal wear, 40 damaged."),
  conditionNotes: z
    .array(z.string())
    .describe(
      "Every VISIBLE scratch, wear mark, stain or missing part. Spanish. Empty only if none.",
    ),
  attributes: z
    .record(z.string(), z.string())
    .describe("Attributes visible or certain: color, material, size, capacity, etc. Spanish."),
  dominantColor: z
    .string()
    .describe("Product's dominant color, e.g. 'negro', 'azul marino', 'madera clara'. Spanish."),
  sellingPoints: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("2-4 honest, concrete reasons to buy this, grounded in what's visible. Spanish."),
  searchQuery: z
    .string()
    .describe("Short query to find the same product on MercadoLibre: brand + model + key spec."),
  bestImageIndex: z
    .number()
    .int()
    .describe("Index (0-based) of the clearest photo showing the whole product."),
});

export type ProductAnalysis = z.infer<typeof analysisSchema>;

export type TavilyResult = { title: string; url: string; content: string };

export const priceResearchSchema = z.object({
  minPrice: z.number().int().nullable().describe("Realistic minimum price in Argentine pesos."),
  maxPrice: z.number().int().nullable().describe("Realistic maximum price in Argentine pesos."),
  summary: z
    .string()
    .describe("One-sentence summary of the range and what it's based on. Spanish."),
  sources: z
    .array(z.object({ title: z.string(), url: z.string(), price: z.number().int().nullable() }))
    .max(6),
});

export type PriceResearch = z.infer<typeof priceResearchSchema>;
