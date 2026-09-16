"use client";

import { Amount } from "@/components/amount";
import { formatArs } from "@/lib/money";
import { cn } from "@/lib/utils";

type PriceProps = {
  listPriceInArs: number;
  offeredPriceInArs: number;
};

export function Price({ listPriceInArs, offeredPriceInArs }: PriceProps) {
  const isDiscounted = offeredPriceInArs < listPriceInArs;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-end rounded-2xl px-3 py-1.5 transition-colors duration-500",
        isDiscounted ? "bg-brand/15" : "bg-secondary",
      )}
    >
      {isDiscounted ? (
        <span className="numeric text-xs text-muted-foreground line-through">
          {formatArs(listPriceInArs)}
        </span>
      ) : null}
      <Amount
        amountInArs={offeredPriceInArs}
        className="font-heading text-lg leading-tight font-semibold text-brand-deep"
      />
    </div>
  );
}
