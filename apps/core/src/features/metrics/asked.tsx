import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ProductQuestions } from "@/features/metrics/questions";

type AskedProps = {
  products: ProductQuestions[];
};

function describeQuestionCount(product: ProductQuestions): string {
  const total = `${product.totalQuestions} ${product.totalQuestions === 1 ? "pregunta" : "preguntas"}`;

  if (product.pendingQuestions === 0) {
    return `${total}, todas respondidas`;
  }

  return `${total}, ${product.pendingQuestions} sin responder`;
}

export function Asked({ products }: AskedProps) {
  return (
    <ul className="flex flex-col gap-3">
      {products.map((product) => (
        <li key={product.productId}>
          <Link
            href={`/product/${product.productId}`}
            className="group flex flex-col gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-secondary"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate font-medium transition-colors group-hover:text-brand-deep">
                {product.title}
              </span>
              <span className="numeric shrink-0 text-[13px] text-muted-foreground">
                {describeQuestionCount(product)}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {product.recentQuestions.map((question) => (
                <li key={question.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{question.question}</span>
                  {question.isPending ? (
                    <Badge variant="outline" className="shrink-0">
                      Sin responder
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </Link>
        </li>
      ))}
    </ul>
  );
}
