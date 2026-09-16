import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { questions } from "@tulocal/database/schema/questions";

import { logEvent } from "@/lib/logger";

const QUESTION_MAX_LENGTH = 500;

export const askSeller = tool({
  description:
    "Usala cuando el comprador pregunte algo que no está en la publicación, en la info de la tienda ni en las respuestas anteriores del dueño. Registra la pregunta para que el dueño la conteste. No inventes la respuesta.",
  inputSchema: z.object({
    question: z
      .string()
      .trim()
      .min(1)
      .max(QUESTION_MAX_LENGTH)
      .describe("La pregunta del comprador, reformulada en una oración clara en español."),
  }),
  contextSchema: z.object({
    conversationId: z.uuid(),
    productId: z.uuid(),
  }),
  execute: async ({ question }, { context }) => {
    const pending = await database.query.questions.findMany({
      where: and(eq(questions.productId, context.productId), eq(questions.status, "pending")),
      columns: { question: true },
    });
    const isAlreadyPending = pending.some(
      (entry) => entry.question.toLowerCase() === question.toLowerCase(),
    );

    if (isAlreadyPending) {
      return { status: "pending" as const };
    }

    await database.insert(questions).values({
      productId: context.productId,
      conversationId: context.conversationId,
      question,
    });
    logEvent({ event: "agent.question.logged", productId: context.productId });

    return { status: "logged" as const };
  },
});
