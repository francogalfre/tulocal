import { AnswerForm } from "@/features/question/form";
import type { OwnedProduct } from "@/features/product/find";

type InboxProps = {
  productId: string;
  questions: OwnedProduct["questions"];
};

export function Inbox({ productId, questions }: InboxProps) {
  const pending = questions.filter((question) => question.status === "pending");
  const answered = questions.filter((question) => question.status === "answered");

  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">Preguntas de compradores</h2>
        <p className="text-sm text-muted-foreground">
          Lo que respondas acá lo usa tu vendedora con todos los que pregunten.
        </p>
      </div>
      {pending.length > 0 ? (
        <ul className="flex flex-col gap-5">
          {pending.map((question) => (
            <li key={question.id} className="flex flex-col gap-3">
              <p className="font-medium">{question.question}</p>
              <AnswerForm productId={productId} questionId={question.id} />
            </li>
          ))}
        </ul>
      ) : null}
      {answered.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {answered.map((question) => (
            <li key={question.id} className="flex flex-col gap-1 border-t border-border pt-3">
              <p className="text-sm text-muted-foreground">{question.question}</p>
              <p>{question.answer}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
