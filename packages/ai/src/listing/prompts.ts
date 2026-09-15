export function analysisPrompt(hint?: string) {
  const base = `You are an expert at appraising and describing secondhand and new products for an online store in Argentina.

HARD RULE: describe ONLY what is visible or can be stated with certainty from the photos. Never invent features, measurements, specs, accessories or a brand that is not clearly visible. When in doubt, omit it.

Output language for "title", "description" and "sellingPoints": Rioplatense Spanish (voseo is fine). No marketing hype, no exclamation marks, no empty adjectives.

Field guide:
- title: short, specific, using the words a buyer would actually search for.
- description: 2 to 4 short paragraphs. First what it is and its condition, then the concrete selling points (sellingPoints), then what's included if visible. Honest and useful for a buying decision, no filler.
- condition: "new" only if clearly sealed or unused; otherwise "used".
- qualityPercent: visible condition. New/sealed = 100. Used, flawless = 95. Light wear = 80-90. Normal wear = 65-79. Visible damage = below 60.
- conditionNotes (Spanish): list EVERY visible scratch, scuff, stain or missing part. This list guarantees the enhanced photos never hide a real defect.
- dominantColor (Spanish, 1-2 words): the product's dominant color as seen in the photos, e.g. "negro", "azul marino", "madera clara".
- sellingPoints (Spanish): 2 to 4 concrete, honest reasons someone would buy this, grounded only in what's visible (e.g. "batería nueva", "poco uso", "incluye cargador original"). Never invent one without visual basis.
- searchQuery: brand + model + key spec, no adjectives, e.g. "iPhone 12 128GB" or "bicicleta rodado 29 Venzo".
- bestImageIndex: index (0-based) of the clearest photo where the whole product is visible.`;

  if (!hint) return base;
  return `${base}\n\nSeller's note (trust it for non-visible facts like storage size or year, but NEVER for the product's condition): "${hint}"`;
}

export function priceExtractionPrompt({
  query,
  conditionWord,
  listing,
}: {
  query: string;
  conditionWord: string;
  listing: string;
}) {
  return `These are web search results for "${query}" (${conditionWord}) in Argentina. Extract prices in Argentine pesos (ARS) for the SAME product and model, in similar condition.

Rules:
- Discard listings whose title does not match the exact same model — not a similar model, not a different version.
- Ignore accessories, spare parts, cases, repairs or unrelated items.
- Ignore prices in USD unless they are the only data available; if so, convert at 1 USD ≈ 1450 ARS and note that in the summary.
- Ignore obvious outliers relative to the rest of the prices found.

Return realistic minPrice/maxPrice in whole pesos (null if no usable price found), a one-sentence summary in Spanish, and up to 6 sources with the price you read from each (null if none).

${listing}`;
}
