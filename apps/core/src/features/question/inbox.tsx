import { More } from "@/components/more";
import { Badge } from "@/components/ui/badge";
import { PendingQuestion } from "@/features/question/pending";
import type { OwnedProduct } from "@/features/product/find";

type InboxProps = {
  productId: string;
  questions: OwnedProduct["questions"];
};

export function Inbox({ productId, questions }: InboxProps) {
  const pendingQuestions = questions.filter((question) => question.status === "pending");
  const answeredQuestions = questions.filter((question) => question.status === "answered");

  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl">Preguntas de compradores</h2>
          {pendingQuestions.length > 0 ? (
            <Badge variant="secondary">{pendingQuestions.length}</Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Lo que respondas acá lo usa tu vendedora con todos los que pregunten.
        </p>
      </div>
      {pendingQuestions.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {pendingQuestions.map((question) => (
            <li key={question.id}>
              <PendingQuestion productId={productId} question={question} />
            </li>
          ))}
        </ul>
      ) : null}
      {answeredQuestions.length > 0 ? (
        <More label={`Ver respuestas (${answeredQuestions.length})`}>
          <ul className="flex flex-col gap-3">
            {answeredQuestions.map((question) => (
              <li key={question.id} className="flex flex-col gap-1 rounded-xl bg-muted px-4 py-3">
                <p className="text-sm text-muted-foreground">{question.question}</p>
                <p>{question.answer}</p>
              </li>
            ))}
          </ul>
        </More>
      ) : null}
    </section>
  );
}
