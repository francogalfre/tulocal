import { generateText, Output } from "ai";
import { z } from "zod";

import type { ImageInput } from "./analyze";
import { MODELS } from "./models";

export type VariantKind = "studio" | "lifestyle" | "enhanced" | "hero";

export const VARIANT_KINDS: VariantKind[] = ["studio", "lifestyle", "enhanced", "hero"];

const PRESERVE = `Edit this exact product photo for a marketplace listing.
The product must remain IDENTICAL: same shape, proportions, colors, materials, logos, printed text, labels, buttons, ports, accessories, and every scratch, scuff, dent, stain or sign of wear that is visible in the original. Do not add, remove, repair, clean, recolor, resize or reposition any part of the product. Do not add new objects touching or overlapping the product. Do not add text or watermarks.
The ONLY allowed change is described next:`;

const VARIANT_PROMPTS: Record<VariantKind, (category: string) => string> = {
  studio: () =>
    "Replace the background with a clean, seamless, light neutral studio backdrop. Soft, even lighting with a subtle natural contact shadow under the product. Product centered and fully visible, same camera angle as the original.",
  lifestyle: (category) =>
    `Place the product, completely unchanged, in a plausible, tasteful real-world setting appropriate for this kind of item (${category}). Natural light, shallow depth of field, the setting is background only and nothing in it touches the product.`,
  enhanced: () =>
    "Keep the exact same scene and background. Only correct exposure, white balance, contrast, sharpness and noise, and straighten the horizon slightly if needed. No other change.",
  hero: () =>
    "Crop tighter so the product fills most of the frame, and replace the background with a soft gradient backdrop in muted tones, with a gentle rim light. Same camera angle as the original.",
};

export type GeneratedVariant =
  | { kind: VariantKind; ok: true; data: Uint8Array; mediaType: string }
  | { kind: VariantKind; ok: false; error: string };

async function generateVariant(
  kind: VariantKind,
  source: ImageInput,
  category: string,
): Promise<GeneratedVariant> {
  try {
    const result = await generateText({
      model: MODELS.image,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${PRESERVE}\n${VARIANT_PROMPTS[kind](category)}` },
            { type: "image", image: source.data, mediaType: source.mediaType },
          ],
        },
      ],
    });
    const file = result.files.find((f) => f.mediaType.startsWith("image/"));
    if (!file) {
      return {
        kind,
        ok: false,
        error: result.text.slice(0, 200) || "El modelo no devolvió imagen",
      };
    }
    return { kind, ok: true, data: file.uint8Array, mediaType: file.mediaType };
  } catch (error) {
    return { kind, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Generates the four selling variants from one source photo. Each variant is
 * independent: a failure never rejects, it is returned as `{ ok: false }`.
 */
export function generateProductImages({
  source,
  category,
  kinds = VARIANT_KINDS,
}: {
  source: ImageInput;
  category: string;
  kinds?: VariantKind[];
}) {
  return kinds.map((kind) => generateVariant(kind, source, category));
}

const fidelitySchema = z.object({
  passes: z.boolean(),
  issues: z.array(z.string()).describe("Diferencias encontradas, en español. Vacío si pasa."),
});

export type FidelityResult = z.infer<typeof fidelitySchema>;

/**
 * Strict guard: compares the original photo with an edited candidate and fails
 * if anything about the product itself changed (including hidden defects).
 */
export async function checkImageFidelity({
  original,
  candidate,
  conditionNotes,
}: {
  original: ImageInput;
  candidate: ImageInput;
  conditionNotes: string[];
}): Promise<FidelityResult> {
  try {
    const result = await generateText({
      model: MODELS.vision,
      output: Output.object({ schema: fidelitySchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Image 1 is the ORIGINAL photo of a product for sale. Image 2 is an EDITED version for the listing.
Only the background, lighting, color balance, framing/crop and sharpness are allowed to change.
FAIL (passes=false) if the product itself differs in any way: shape, proportions, color, materials, logos, text, buttons, ports, parts, accessories, or if any visible wear/defect was removed, reduced or added. Pay special attention to these known defects from the original, which must still be visible if they were in frame: ${conditionNotes.length ? conditionNotes.join("; ") : "(none listed)"}.
Be strict: when in doubt, fail. List concrete issues in Spanish.`,
            },
            { type: "image", image: original.data, mediaType: original.mediaType },
            { type: "image", image: candidate.data, mediaType: candidate.mediaType },
          ],
        },
      ],
    });
    return result.output;
  } catch (error) {
    return {
      passes: false,
      issues: [`No se pudo verificar: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}
