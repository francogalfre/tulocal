"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "cn";

type CountProps = {
  count: number;
  className?: string;
};

export function Count({ count, className }: CountProps) {
  return <NumberFlow value={count} locales="es-AR" className={cn("numeric", className)} />;
}
