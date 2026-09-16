"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "cn";

import { ARS_NUMBER_FORMAT } from "@/lib/money";

type AmountProps = {
  amountInArs: number;
  spinTiming?: EffectTiming;
  transformTiming?: EffectTiming;
  className?: string;
};

export function Amount({ amountInArs, spinTiming, transformTiming, className }: AmountProps) {
  return (
    <NumberFlow
      value={amountInArs}
      locales="es-AR"
      format={ARS_NUMBER_FORMAT}
      spinTiming={spinTiming}
      transformTiming={transformTiming}
      className={cn("numeric", className)}
    />
  );
}
