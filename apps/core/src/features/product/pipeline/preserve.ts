export const CAMERA_RULES =
  "Output a photorealistic photograph, as if shot on a full-frame camera with a 50mm lens: natural color, real grain, true-to-life materials and reflections, correct perspective, no illustration, no 3D-render look, no HDR glow, no text, no watermark, no borders.";

export type PreservationInput = {
  conditionNotes: string[];
};

export function buildPreservationRules(input: PreservationInput): string {
  const defects =
    input.conditionNotes.length === 0 ? "none listed" : input.conditionNotes.join("; ");

  return `This is a real photo of a product that is for sale. The product must remain exactly as photographed: same shape, proportions, colors, materials, textures, logos, printed text, buttons, cables, accessories and wear. Do not repair, clean, recolor, resize, duplicate, mirror or straighten any part of it. Do not add or remove anything on the product. Do not invent detail that is not in the photo. These visible defects must stay visible and unaltered: ${defects}. Only the background, surface, lighting and framing may change, as described next.`;
}
