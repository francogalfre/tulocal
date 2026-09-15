import { z } from "zod";

export type VariantKind = "studio" | "lifestyle" | "hero";

export const VARIANT_KINDS: VariantKind[] = ["studio", "lifestyle", "hero"];

export type GeneratedVariant =
  | { kind: VariantKind; ok: true; data: Uint8Array; mediaType: string }
  | { kind: VariantKind; ok: false; error: string };

export const fidelitySchema = z.object({
  passes: z.boolean(),
  issues: z.array(z.string()).describe("Differences found, in Spanish. Empty if it passes."),
});

export type FidelityResult = z.infer<typeof fidelitySchema>;
