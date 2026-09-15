import { TRPCError } from "@trpc/server";
import { conversation, message } from "@tulocal/db/schema/index";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";
import { getOwnedProduct } from "../lib/store";

function toUIMessages(
  rows: { id: string; role: "user" | "assistant" | "system"; parts: unknown[] }[],
) {
  return rows.map((row) => ({ id: row.id, role: row.role, parts: row.parts }));
}

export const conversationRouter = router({
  listByProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.productId);
      const rows = await ctx.db.query.conversation.findMany({
        where: eq(conversation.productId, item.id),
        orderBy: desc(conversation.updatedAt),
        with: { messages: { orderBy: desc(message.createdAt), limit: 1 } },
      });
      return rows.map(({ messages, ...row }) => {
        const last = messages[0];
        const lastText = last
          ? (last.parts as { type: string; text?: string }[])
              .filter((part) => part.type === "text")
              .map((part) => part.text ?? "")
              .join(" ")
              .slice(0, 120)
          : "";
        return { ...row, lastMessage: lastText, lastRole: last?.role ?? null };
      });
    }),

  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.conversation.findFirst({
      where: eq(conversation.id, input.id),
      with: { messages: { orderBy: asc(message.createdAt) } },
    });
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    await getOwnedProduct(ctx, row.productId);
    const { messages, ...rest } = row;
    return { ...rest, messages: toUIMessages(messages) };
  }),

  getForVisitor: publicProcedure
    .input(z.object({ productId: z.string(), visitorId: z.string().min(8).max(64) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.conversation.findFirst({
        where: and(
          eq(conversation.productId, input.productId),
          eq(conversation.visitorId, input.visitorId),
        ),
        with: { messages: { orderBy: asc(message.createdAt) } },
      });
      if (!row) return null;
      return {
        id: row.id,
        status: row.status,
        agreedPrice: row.agreedPrice,
        whatsappUrl: row.whatsappUrl,
        messages: toUIMessages(row.messages),
      };
    }),
});
