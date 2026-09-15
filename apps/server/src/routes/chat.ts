import { createNegotiationAgent, type NegotiationContext } from "@tulocal/ai";
import { conversation, message, product } from "@tulocal/db/schema/index";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { env } from "../env";
import { getDb } from "../services";

const bodySchema = z.object({
  messages: z.array(z.custom<UIMessage>((value) => typeof value === "object" && value !== null)),
  productId: z.string(),
  visitorId: z.string().min(8).max(64),
});

/** Streaming negotiation chat for storefront visitors. */
export const chatRoute = new Hono().post("/", async (c) => {
  const parsed = bodySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Body inválido" }, 400);
  const { messages, productId, visitorId } = parsed.data;
  const db = getDb();

  const item = await db.query.product.findFirst({
    where: and(eq(product.id, productId), eq(product.published, true)),
    with: { store: true },
  });
  if (!item || !item.listPrice || !item.title) {
    return c.json({ error: "Producto no disponible" }, 404);
  }

  let convo = await db.query.conversation.findFirst({
    where: and(eq(conversation.productId, productId), eq(conversation.visitorId, visitorId)),
  });
  if (!convo) {
    const [created] = await db
      .insert(conversation)
      .values({ productId, storeId: item.storeId, visitorId })
      .returning();
    convo = created!;
  }
  const conversationId = convo.id;

  const lastMessage = messages.at(-1);
  if (lastMessage?.role === "user") {
    await db.insert(message).values({
      conversationId,
      role: "user",
      parts: lastMessage.parts as unknown[],
    });
  }

  const step = item.listPrice >= 100_000 ? 1000 : 100;
  const ctx: NegotiationContext = {
    product: {
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      brand: item.brand,
      model: item.model,
      condition: item.condition,
      qualityPercent: item.qualityPercent,
      conditionNotes: item.conditionNotes,
      attributes: item.attributes,
      listPrice: item.listPrice,
      minPrice: item.minPrice ?? Math.round((item.listPrice * 0.8) / step) * step,
      marketMinPrice: item.marketMinPrice,
      marketMaxPrice: item.marketMaxPrice,
      marketSummary: item.marketSummary,
    },
    store: { name: item.store.name, whatsappPhone: item.store.whatsappPhone },
    state: {
      round: convo.round,
      currentAsk: convo.currentAsk,
      lastOffer: convo.lastOffer,
      status: convo.status,
      agreedPrice: convo.agreedPrice,
    },
    productUrl: `${env.APP_URL}/s/${item.store.slug}/p/${item.id}`,
  };

  const agent = createNegotiationAgent(ctx, {
    onOffer: async (state) => {
      await db.update(conversation).set(state).where(eq(conversation.id, conversationId));
    },
    onDeal: async (deal) => {
      await db
        .update(conversation)
        .set({
          status: "deal",
          agreedPrice: deal.agreedPrice,
          dealSummary: deal.summary,
          whatsappUrl: deal.whatsappUrl,
        })
        .where(eq(conversation.id, conversationId));
    },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages.slice(-24),
    onFinish: async ({ responseMessage }) => {
      await db.insert(message).values({
        conversationId,
        role: "assistant",
        parts: responseMessage.parts as unknown[],
      });
    },
  });
});
