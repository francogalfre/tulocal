import { generateText, Output } from "ai";
import { z } from "zod";

import { rememberCache } from "@tulocal/storage/cache";
import type { CacheEntry } from "@tulocal/storage/cache";

import { CONDITION_LABELS } from "@/features/product/condition";
import { fastModel } from "@/features/product/pipeline/models";
import { formatArs } from "@/lib/money";
import { buildProductUrl } from "@/lib/url";
import type { ExportableProduct } from "@/features/product/export/exportable";

const CAPTION_CACHE_PREFIX = "export-caption";

const CAPTION_CACHE_TIME_TO_LIVE_IN_SECONDS = 60 * 60 * 24 * 7;

const CAPTION_MAX_LINES = 4;

const HASHTAGS_MAX_COUNT = 3;

const captionSchema = z.object({
  text: z
    .string()
    .describe(
      "The Instagram caption, ready to paste: short lines separated by line breaks, the price, the link, then the hashtags on the last line.",
    ),
});

export type Caption = z.infer<typeof captionSchema>;

function buildCaptionCacheEntry(product: ExportableProduct): CacheEntry<Caption> {
  return {
    key: `${CAPTION_CACHE_PREFIX}:${product.id}:${product.updatedAt.toISOString()}`,
    schema: captionSchema,
    timeToLiveInSeconds: CAPTION_CACHE_TIME_TO_LIVE_IN_SECONDS,
  };
}

function buildCaptionPrompt(product: ExportableProduct): string {
  const condition = product.condition === null ? "not stated" : CONDITION_LABELS[product.condition];
  const facts = product.facts.length === 0 ? "none" : product.facts.join("; ");

  return `Write the Instagram caption for a product that a small shop in Argentina is selling through its tulocal store.

Language: Rioplatense Spanish with voseo. At most ${CAPTION_MAX_LINES} short lines, no exclamation marks, no marketing hype, no empty adjectives, no emojis. Do not use em dashes.

Only use these facts. Do not add anything that is not here.
- Title: ${product.title}
- Description: ${product.description ?? "none"}
- Condition: ${condition}
- Price: ${formatArs(product.listPriceInArs)}
- Useful facts: ${facts}
- Link to the listing: ${buildProductUrl(product.store.handle, product.id)}

The caption says what the product is, states the price, invites the reader to ask through the link, and ends with a separate line of at most ${HASHTAGS_MAX_COUNT} relevant hashtags in Spanish.`;
}

async function generateCaption(product: ExportableProduct): Promise<Caption> {
  const { output } = await generateText({
    model: fastModel,
    output: Output.object({ schema: captionSchema }),
    prompt: buildCaptionPrompt(product),
  });

  return output;
}

export async function writeCaption(product: ExportableProduct): Promise<Caption> {
  return rememberCache(buildCaptionCacheEntry(product), () => generateCaption(product));
}
