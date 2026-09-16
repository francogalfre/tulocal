"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { questions } from "@tulocal/database/schema/questions";

import { findOwnedProduct } from "@/features/product/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

const ANSWER_MAX_LENGTH = 1000;

const answerSchema = z.object({
  productId: z.uuid(),
  questionId: z.uuid(),
  answer: z.string().trim().min(1).max(ANSWER_MAX_LENGTH),
});

export type AnswerQuestionState = {
  error: string | null;
};

export async function answerQuestion(
  _previousState: AnswerQuestionState,
  formData: FormData,
): Promise<AnswerQuestionState> {
  const session = await requireCurrentSession();
  const parsed = answerSchema.safeParse({
    productId: formData.get("productId"),
    questionId: formData.get("questionId"),
    answer: formData.get("answer"),
  });

  if (!parsed.success) {
    return { error: "Escribí una respuesta." };
  }

  const product = await findOwnedProduct(parsed.data.productId, session.user.id);

  if (product === null) {
    return { error: "No encontramos el producto." };
  }

  await database
    .update(questions)
    .set({ answer: parsed.data.answer, status: "answered", answeredAt: new Date() })
    .where(and(eq(questions.id, parsed.data.questionId), eq(questions.productId, product.id)));
  logEvent({ event: "question.answered", productId: product.id, storeId: product.store.id });
  revalidatePath(`/product/${product.id}`);

  return { error: null };
}
