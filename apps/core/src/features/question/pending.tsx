"use client";

import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Fold } from "@/components/motion/fold";
import { Swap } from "@/components/motion/swap";
import { Button } from "@/components/ui/button";
import { AnswerForm } from "@/features/question/form";
import type { OwnedProduct } from "@/features/product/find";

type PendingQuestionProps = {
  productId: string;
  question: OwnedProduct["questions"][number];
};

export function PendingQuestion({ productId, question }: PendingQuestionProps) {
  const [isAnswering, setIsAnswering] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted px-4 py-4">
      <p className="font-medium">{question.question}</p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="self-start"
        onClick={() => setIsAnswering((answering) => !answering)}
        aria-expanded={isAnswering}
      >
        <Swap activeKey={isAnswering ? "cancel" : "answer"} data-icon="inline-start">
          {isAnswering ? <tulocalIcons.close /> : <tulocalIcons.pencil />}
        </Swap>
        {isAnswering ? "Cancelar" : "Responder"}
      </Button>
      <Fold isOpen={isAnswering}>
        <AnswerForm productId={productId} questionId={question.id} />
      </Fold>
    </div>
  );
}
