"use client";

import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Amount } from "@/components/amount";
import { roundToPriceStep } from "@/features/product/pipeline/pricing";
import { readSliderValue } from "@/features/product/review/slider";

const SLIDER_STEPS = 100;

type PriceFieldProps = {
  listPriceInArs: number;
  suggestedMinimumPriceInArs: number | null;
  suggestedMaximumPriceInArs: number | null;
  hasSuggestion: boolean;
  onChange: (listPriceInArs: number) => void;
};

export function PriceField({
  listPriceInArs,
  suggestedMinimumPriceInArs,
  suggestedMaximumPriceInArs,
  hasSuggestion,
  onChange,
}: PriceFieldProps) {
  const [isEditing, setIsEditing] = useState(!hasSuggestion);
  const hasRange =
    suggestedMinimumPriceInArs !== null &&
    suggestedMaximumPriceInArs !== null &&
    suggestedMinimumPriceInArs < suggestedMaximumPriceInArs;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">Precio de venta</span>
        {isEditing ? (
          <Input
            id="listPriceInput"
            type="number"
            inputMode="numeric"
            min={1}
            autoFocus={hasSuggestion}
            aria-label="Precio de venta"
            className="numeric h-14 font-heading text-4xl font-semibold text-brand-deep"
            value={listPriceInArs === 0 ? "" : listPriceInArs}
            onChange={(event) => onChange(Number(event.target.value))}
            onBlur={() => setIsEditing(listPriceInArs <= 0)}
            required
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="group flex w-fit items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Amount
              amountInArs={listPriceInArs}
              className="font-heading text-[3.25rem] leading-none font-semibold text-brand-deep"
            />
            <tulocalIcons.pencil
              className="size-5 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {hasRange ? (
        <div className="flex flex-col gap-3">
          <Slider
            min={suggestedMinimumPriceInArs}
            max={suggestedMaximumPriceInArs}
            step={Math.max(
              1,
              Math.round((suggestedMaximumPriceInArs - suggestedMinimumPriceInArs) / SLIDER_STEPS),
            )}
            value={listPriceInArs}
            onValueChange={(sliderValue) =>
              onChange(roundToPriceStep(readSliderValue(sliderValue)))
            }
            aria-label="Precio de venta"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Vender rápido</span>
            <span>Pedir más</span>
          </div>
        </div>
      ) : null}
      {hasSuggestion ? null : (
        <p className="text-sm text-muted-foreground">
          No encontramos precios parecidos. Ponele el precio que te parezca.
        </p>
      )}
    </section>
  );
}
