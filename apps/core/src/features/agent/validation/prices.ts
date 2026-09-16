const PRICE_PATTERN = /(\$\s?)?(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)(?:\s?(k|mil|lucas|pesos)\b)?/giu;

const THOUSAND = 1000;

const THOUSAND_SUFFIXES = new Set(["k", "mil", "lucas"]);

function parseAmount(digits: string): number {
  return Number(digits.replaceAll(".", "").replace(",", "."));
}

export function extractPricesInArs(text: string): number[] {
  const prices: number[] = [];

  for (const match of text.matchAll(PRICE_PATTERN)) {
    const [, currencyPrefix, digits, suffix] = match;

    if (digits === undefined) {
      continue;
    }

    const hasThousandsSeparator = digits.includes(".");
    const normalizedSuffix = suffix?.toLowerCase();
    const isPrice =
      currencyPrefix !== undefined || hasThousandsSeparator || normalizedSuffix !== undefined;

    if (!isPrice) {
      continue;
    }

    const multiplier =
      normalizedSuffix !== undefined && THOUSAND_SUFFIXES.has(normalizedSuffix) ? THOUSAND : 1;

    prices.push(Math.round(parseAmount(digits) * multiplier));
  }

  return prices;
}
