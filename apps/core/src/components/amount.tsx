"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "cn";

import { ARS_NUMBER_FORMAT } from "@/lib/money";

type AmountProps = {
  amountInArs: number;
  className?: string;
};

export function Amount({ amountInArs, className }: AmountProps) {
  return (
    <NumberFlow
      value={amountInArs}
      locales="es-AR"
      format={ARS_NUMBER_FORMAT}
      className={cn("numeric", className)}
    />
  );
}
