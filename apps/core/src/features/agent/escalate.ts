import { and, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { escalations } from "@tulocal/database/schema/escalations";

import { logEvent } from "@/lib/logger";

export type EscalationKind = "buy_intent" | "scam_suspected";

export type EscalationInput = {
  conversationId: string;
  productId: string;
  storeId: string;
  kind: EscalationKind;
  summary: string;
  agreedPriceInArs: number | null;
};

export type EscalationOutcome = "created" | "existing";

export async function createEscalationOnce(input: EscalationInput): Promise<EscalationOutcome> {
  const existing = await database.query.escalations.findFirst({
    where: and(
      eq(escalations.conversationId, input.conversationId),
      eq(escalations.kind, input.kind),
    ),
    columns: { id: true },
  });

  if (existing !== undefined) {
    return "existing";
  }

  await database.insert(escalations).values({
    conversationId: input.conversationId,
    productId: input.productId,
    storeId: input.storeId,
    kind: input.kind,
    summary: input.summary,
    agreedPriceInArs: input.agreedPriceInArs,
  });
  logEvent({
    event: "agent.escalation.created",
    productId: input.productId,
    storeId: input.storeId,
    detail: input.kind,
  });

  return "created";
}
