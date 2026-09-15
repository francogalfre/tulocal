import type { VariantKind } from "./index";

const PRESERVATION_RULES = (
  conditionNotes: string[],
) => `You are editing a real photo of a product for an online marketplace listing. The product itself must stay 100% identical to the source photo: same shape, proportions, colors, materials, textures, logos, printed text, labels, buttons, ports, cables and accessories.

Forbidden, no exceptions:
- Do not repair, clean, recolor, resize, reposition, duplicate or straighten any part of the product.
- Do not add or remove accessories, parts, props, hands, new reflections, text, logos or watermarks.
- Do not invent detail that is not visible in the source photo.

Known visible defects that MUST remain visible and unaltered: ${conditionNotes.length ? conditionNotes.join("; ") : "(none listed)"}.

The only allowed change is described next:`;

const VARIANT_PROMPTS: Record<
  VariantKind,
  (input: { category: string; dominantColor: string }) => string
> = {
  studio: () =>
    "Replace the background with a seamless, pure white studio backdrop. Soft, even three-point lighting with a subtle, realistic contact shadow directly under the product, no hard shadows. Center the product, fully in frame, same camera angle and crop as the original. This is the primary photo a buyer sees first: it must look like professional e-commerce photography.",
  lifestyle: ({ category, dominantColor }) =>
    `Place the product, completely unchanged, into a plausible, tidy real-world setting where a ${category} is normally seen or used. Natural daylight, shallow depth of field so the background stays soft and out of focus, nothing in the scene touches or overlaps the product. The setting should complement the product's ${dominantColor} color without competing with it.`,
  hero: ({ dominantColor }) =>
    `Crop tighter so the product fills most of the frame, and replace the background with a smooth gradient backdrop in a muted tone that complements the product's ${dominantColor} color (a desaturated shade nearby on the color wheel, never the same hue, never a clashing neon). Add a gentle rim light along the product's edges. Same camera angle as the original.`,
};

export function variantPrompt(
  kind: VariantKind,
  input: { category: string; dominantColor: string; conditionNotes: string[] },
) {
  return `${PRESERVATION_RULES(input.conditionNotes)}\n${VARIANT_PROMPTS[kind](input)}`;
}

export function fidelityPrompt(conditionNotes: string[]) {
  return `
    Image 1 is the ORIGINAL photo of a product for sale. Image 2 is an EDITED version for the listing.
    Only the background, lighting, color balance, framing/crop and sharpness are allowed to change.
    FAIL (passes=false) if the product itself differs in any way: shape, proportions, color, materials, logos, text, buttons, ports, parts, accessories, or if any visible wear/defect was removed, reduced or added. Pay special attention to these known defects from the original, which must still be visible if they were in frame: ${conditionNotes.length ? conditionNotes.join("; ") : "(none listed)"}.
    Be strict: when in doubt, fail. List concrete issues in Spanish.
  `;
}
