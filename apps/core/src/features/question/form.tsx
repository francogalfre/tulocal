"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { answerQuestion } from "@/features/question/answer";
import type { AnswerQuestionState } from "@/features/question/answer";

const INITIAL_STATE: AnswerQuestionState = { error: null };

type AnswerFormProps = {
  productId: string;
  questionId: string;
};

export function AnswerForm({ productId, questionId }: AnswerFormProps) {
  const [state, submit, isPending] = useActionState(answerQuestion, INITIAL_STATE);

  return (
    <form action={submit} className="flex flex-col gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="questionId" value={questionId} />
      <Textarea
        name="answer"
        rows={2}
        placeholder="Tu respuesta. Queda guardada en la publicación."
        aria-label="Respuesta"
        required
      />
      {state.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="lg" className="self-end" disabled={isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "Guardando" : "Responder"}
      </Button>
    </form>
  );
}
