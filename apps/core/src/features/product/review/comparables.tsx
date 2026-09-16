import type { OwnedProduct } from "@/features/product/find";
import { formatArs } from "@/lib/money";

type ComparablesProps = {
  comparables: OwnedProduct["comparables"];
};

export function Comparables({ comparables }: ComparablesProps) {
  if (comparables.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg">precios parecidos</h2>
      <ul className="flex flex-col gap-2">
        {comparables.map((comparable) => (
          <li key={comparable.id} className="flex items-baseline justify-between gap-4 text-sm">
            <a
              href={comparable.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-muted-foreground"
            >
              {comparable.title}
            </a>
            <span className="shrink-0 font-heading font-semibold">
              {formatArs(comparable.priceInArs)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
