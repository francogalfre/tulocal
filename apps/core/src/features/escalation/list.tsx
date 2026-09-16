import { Badge } from "@/components/ui/badge";
import { Amount } from "@/components/amount";
import type { OwnedProduct } from "@/features/product/find";
import { formatDateTime } from "@/lib/time";

type EscalationListProps = {
  escalations: OwnedProduct["escalations"];
};

const KIND_LABELS = {
  buy_intent: "En serio",
  scam_suspected: "Posible estafa",
};

export function EscalationList({ escalations }: EscalationListProps) {
  if (escalations.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">Compradores interesados</h2>
        <p className="text-sm text-muted-foreground">
          Cuando alguien quiere comprar, le damos tu WhatsApp para que te escriba.
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {escalations.map((escalation) => (
          <li key={escalation.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={escalation.kind === "buy_intent" ? "default" : "destructive"}>
                {KIND_LABELS[escalation.kind]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(escalation.createdAt)}
              </span>
            </div>
            <p>{escalation.summary}</p>
            {escalation.agreedPriceInArs !== null ? (
              <p className="text-sm text-muted-foreground">
                Precio acordado:{" "}
                <Amount
                  amountInArs={escalation.agreedPriceInArs}
                  className="font-medium text-foreground"
                />
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
