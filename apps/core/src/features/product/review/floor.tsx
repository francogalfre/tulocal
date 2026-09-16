"use client";

import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Amount } from "@/components/amount";
import { Count } from "@/components/count";
import { roundToPriceStep } from "@/features/product/pipeline/pricing";
import { readSliderValue } from "@/features/product/review/slider";

const SLIDER_STEPS = 100;

const LOWEST_FLOOR_RATIO = 0.5;

const PERCENT = 100;

type FloorFieldProps = {
  floorPriceInArs: number;
  listPriceInArs: number;
  onChange: (floorPriceInArs: number) => void;
};

function computeDiscountPercent(floorPriceInArs: number, listPriceInArs: number): number {
  if (listPriceInArs <= 0) {
    return 0;
  }

  return Math.max(0, Math.round((1 - floorPriceInArs / listPriceInArs) * PERCENT));
}

export function FloorField({ floorPriceInArs, listPriceInArs, onChange }: FloorFieldProps) {
  const [isEditing, setIsEditing] = useState(floorPriceInArs <= 0);
  const lowestFloorInArs = roundToPriceStep(listPriceInArs * LOWEST_FLOOR_RATIO);
  const hasRange = listPriceInArs > 0 && lowestFloorInArs < listPriceInArs;
  const discountPercent = computeDiscountPercent(floorPriceInArs, listPriceInArs);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <tulocalIcons.lock className="size-3.5" aria-hidden="true" />
          Precio mínimo, solo lo ves vos
        </span>
        {isEditing ? (
          <Input
            id="floorPriceInput"
            type="number"
            inputMode="numeric"
            min={1}
            max={listPriceInArs > 0 ? listPriceInArs : undefined}
            autoFocus={floorPriceInArs > 0}
            aria-label="Precio mínimo"
            className="numeric h-14 font-heading text-4xl font-semibold text-warning"
            value={floorPriceInArs === 0 ? "" : floorPriceInArs}
            onChange={(event) => onChange(Number(event.target.value))}
            onBlur={() => setIsEditing(floorPriceInArs <= 0)}
            required
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="group flex w-fit items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Amount
              amountInArs={floorPriceInArs}
              className="font-heading text-4xl leading-none font-semibold text-warning"
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
            min={lowestFloorInArs}
            max={listPriceInArs}
            step={Math.max(1, Math.round((listPriceInArs - lowestFloorInArs) / SLIDER_STEPS))}
            value={Math.min(Math.max(floorPriceInArs, lowestFloorInArs), listPriceInArs)}
            onValueChange={(sliderValue) =>
              onChange(roundToPriceStep(readSliderValue(sliderValue)))
            }
            aria-label="Precio mínimo"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Más margen</span>
            <span>
              Hasta <Count count={discountPercent} />
              {" "}% menos
            </span>
          </div>
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Tu vendedora negocia con los compradores, pero nunca baja de acá.
      </p>
    </section>
  );
}
