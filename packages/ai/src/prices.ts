import { generateText, Output } from "ai";
import { z } from "zod";

import { MODELS } from "./models";

type TavilyResult = { title: string; url: string; content: string };

async function tavilySearch(
  apiKey: string,
  query: string,
  options: { includeDomains?: string[] } = {},
): Promise<TavilyResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      max_results: 10,
      search_depth: "basic",
      ...(options.includeDomains ? { include_domains: options.includeDomains } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Tavily ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  const json = (await response.json()) as { results?: TavilyResult[] };
  return json.results ?? [];
}

const priceSchema = z.object({
  minPrice: z.number().int().nullable().describe("Precio mínimo realista en pesos argentinos"),
  maxPrice: z.number().int().nullable().describe("Precio máximo realista en pesos argentinos"),
  summary: z.string().describe("Una oración en español resumiendo el rango y en qué se basa"),
  sources: z
    .array(z.object({ title: z.string(), url: z.string(), price: z.number().int().nullable() }))
    .max(6),
});

export type PriceResearch = z.infer<typeof priceSchema>;

export async function researchPrices({
  query,
  tavilyApiKey,
  condition,
}: {
  query: string;
  tavilyApiKey: string;
  condition: "new" | "used";
}): Promise<PriceResearch> {
  if (!tavilyApiKey) throw new Error("TAVILY_API_KEY no configurada");

  const conditionWord = condition === "used" ? "usado" : "nuevo";
  let results = await tavilySearch(tavilyApiKey, `${query} ${conditionWord}`, {
    includeDomains: ["mercadolibre.com.ar", "articulo.mercadolibre.com.ar"],
  });
  if (results.length < 5) {
    const extra = await tavilySearch(tavilyApiKey, `${query} ${conditionWord} precio argentina`);
    results = [...results, ...extra];
  }
  if (results.length === 0) throw new Error("Sin resultados de búsqueda");

  const listing = results
    .slice(0, 16)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content.slice(0, 400)}`)
    .join("\n\n");

  const result = await generateText({
    model: MODELS.vision,
    output: Output.object({ schema: priceSchema }),
    prompt: `These are web search results for "${query}" (${conditionWord}) in Argentina. Extract prices in Argentine pesos (ARS) for the SAME product in similar condition.
Rules: ignore accessories, parts, cases, repairs or unrelated items; ignore prices in USD unless they are clearly the only data (then convert with 1 USD ≈ 1450 ARS and say so in the summary); ignore obvious outliers. Return realistic minPrice/maxPrice as whole pesos (null if no usable price found), a one-sentence Spanish summary, and up to 6 sources with the price you read from each (null if none).

${listing}`,
  });
  return result.output;
}
