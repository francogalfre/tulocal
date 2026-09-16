import { Badge } from "@/components/ui/badge";
import { Amount } from "@/components/amount";
import type { OwnedProduct } from "@/features/product/find";

const SOURCE_LABELS = {
  mercadolibre: "Mercado Libre",
  facebook: "Facebook",
  other: "Web",
};

type ComparablesProps = {
  comparables: OwnedProduct["comparables"];
};

export function Comparables({ comparables }: ComparablesProps) {
  if (comparables.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg">Precios parecidos</h2>
        <p className="text-sm text-muted-foreground">De acá salió el precio sugerido.</p>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {comparables.map((comparable) => (
          <li key={comparable.id}>
            <a
              href={comparable.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 py-3 outline-none focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm group-hover:underline group-hover:underline-offset-4">
                  {comparable.title}
                </span>
                <Badge variant="outline">{SOURCE_LABELS[comparable.source]}</Badge>
              </span>
              <Amount
                amountInArs={comparable.priceInArs}
                className="shrink-0 font-heading font-semibold"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
