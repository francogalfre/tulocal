import { generateText, Output } from "ai";

import type { ImageInput } from "../utils/format";
import { MODELS } from "../utils/models";
import { fidelityPrompt, variantPrompt } from "./prompts";
import {
  fidelitySchema,
  VARIANT_KINDS,
  type FidelityResult,
  type GeneratedVariant,
  type VariantKind,
} from "./schema";

export {
  VARIANT_KINDS,
  type FidelityResult,
  type GeneratedVariant,
  type VariantKind,
} from "./schema";

async function generateVariant(
  kind: VariantKind,
  source: ImageInput,
  variantInput: { category: string; dominantColor: string; conditionNotes: string[] },
): Promise<GeneratedVariant> {
  try {
    const result = await generateText({
      model: MODELS.image,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: variantPrompt(kind, variantInput) },
            { type: "image", image: source.data, mediaType: source.mediaType },
          ],
        },
      ],
    });

    const generatedFile = result.files.find((file) => file.mediaType.startsWith("image/"));
    if (!generatedFile) {
      return {
        kind,
        ok: false,
        error: result.text.slice(0, 200) || "El modelo no devolvió imagen",
      };
    }

    return {
      kind,
      ok: true,
      data: generatedFile.uint8Array,
      mediaType: generatedFile.mediaType,
    };
  } catch (error) {
    return { kind, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function generateProductImages({
  source,
  category,
  dominantColor,
  conditionNotes,
  kinds = VARIANT_KINDS,
}: {
  source: ImageInput;
  category: string;
  dominantColor: string;
  conditionNotes: string[];
  kinds?: VariantKind[];
}) {
  return kinds.map((kind) =>
    generateVariant(kind, source, { category, dominantColor, conditionNotes }),
  );
}

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
            { type: "text", text: fidelityPrompt(conditionNotes) },
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
