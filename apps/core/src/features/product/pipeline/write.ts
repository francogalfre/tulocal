import { generateText, Output } from "ai";
import { z } from "zod";

import { visionModel } from "@/features/product/pipeline/models";
import type { Identification } from "@/features/product/pipeline/identify";

const listingSchema = z.object({
  title: z.string().max(80).describe("Short, specific title a buyer would search for."),
  description: z
    .string()
    .describe("Two to four short paragraphs: what it is, its condition, what is included."),
});

export type Listing = z.infer<typeof listingSchema>;

const TITLE_MAX_LENGTH = 80;

function buildWritingPrompt(identification: Identification): string {
  const notes =
    identification.conditionNotes.length === 0
      ? "ninguno"
      : identification.conditionNotes.join("; ");

  return `Write the listing for a product sold from a small online shop in Argentina.

Language: Rioplatense Spanish with voseo. Short sentences, no exclamation marks, no marketing hype, no empty adjectives. Do not use em dashes.

Only use these facts. Do not add anything that is not here.
- Category: ${identification.category}
- Brand: ${identification.brand ?? "not visible"}
- Model: ${identification.model ?? "not visible"}
- Condition: ${identification.condition === "new" ? "nuevo" : "usado"}
- Visible defects: ${notes}
- Attributes: ${identification.attributes.join("; ")}

The title has at most ${TITLE_MAX_LENGTH} characters and states what the product is. The description is honest and useful for deciding whether to buy, and mentions the defects plainly.`;
}

export async function writeListing(identification: Identification): Promise<Listing> {
  const { output } = await generateText({
    model: visionModel,
    output: Output.object({ schema: listingSchema }),
    prompt: buildWritingPrompt(identification),
  });

  return output;
}
