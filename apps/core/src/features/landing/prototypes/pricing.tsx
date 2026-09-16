"use client";

import { cn } from "cn";
import { useState } from "react";

import { Amount } from "@/components/amount";

const MINIMUM_PRICE_IN_ARS = 68000;
const MAXIMUM_PRICE_IN_ARS = 98000;
const PRICE_STEP_IN_ARS = 1000;
const INITIAL_POSITION_PERCENT = 40;

const COMPARABLE_POSITION_CLASSNAMES = ["left-1/4", "left-1/2", "left-3/4"];

const SLIDER_CLASSNAME =
  "w-full cursor-grab appearance-none rounded-full bg-transparent outline-none active:cursor-grabbing focus-visible:ring-3 focus-visible:ring-ring/50 [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-secondary [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-secondary [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary";

function computePriceInArs(positionPercent: number): number {
  const priceSpanInArs = MAXIMUM_PRICE_IN_ARS - MINIMUM_PRICE_IN_ARS;
  const exactPriceInArs = MINIMUM_PRICE_IN_ARS + (priceSpanInArs * positionPercent) / 100;

  return Math.round(exactPriceInArs / PRICE_STEP_IN_ARS) * PRICE_STEP_IN_ARS;
}

export function PricingPrototype() {
  const [positionPercent, setPositionPercent] = useState(INITIAL_POSITION_PERCENT);

  return (
    <div className="flex w-full max-w-56 flex-col gap-6">
      <Amount
        amountInArs={computePriceInArs(positionPercent)}
        className="font-heading text-3xl font-semibold"
      />
      <div className="flex flex-col gap-3">
        <div className="relative h-2">
          {COMPARABLE_POSITION_CLASSNAMES.map((positionClassName) => (
            <span
              key={positionClassName}
              aria-hidden="true"
              className={cn(
                "absolute bottom-0 h-2 w-0.5 -translate-x-1/2 rounded-full bg-foreground/25",
                positionClassName,
              )}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={positionPercent}
          aria-label="Precio de tu publicación"
          onChange={(event) => setPositionPercent(Number(event.target.value))}
          className={SLIDER_CLASSNAME}
        />
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>Vender rápido</span>
          <span>Esperar más</span>
        </div>
      </div>
    </div>
  );
}
