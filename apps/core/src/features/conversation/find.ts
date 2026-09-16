import { and, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";

export type Conversation = typeof conversations.$inferSelect;

export type ConversationLookup = {
  productId: string;
  storeId: string;
  buyerToken: string;
};

export async function findConversationByToken(
  productId: string,
  buyerToken: string,
): Promise<Conversation | null> {
  const conversation = await database.query.conversations.findFirst({
    where: and(eq(conversations.productId, productId), eq(conversations.buyerToken, buyerToken)),
  });

  return conversation ?? null;
}

export async function createConversation(input: ConversationLookup): Promise<Conversation> {
  const [created] = await database
    .insert(conversations)
    .values({
      productId: input.productId,
      storeId: input.storeId,
      buyerToken: input.buyerToken,
    })
    .returning();

  if (created === undefined) {
    throw new Error("No se pudo crear la conversación");
  }

  return created;
}
