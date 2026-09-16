"use client";

import { Count } from "@/components/count";
import { useRevealedCountOnView } from "@/features/metrics/reveal";

type StatProps = {
  label: string;
  total: number;
};

export function Stat({ label, total }: StatProps) {
  const { containerReference, revealed } = useRevealedCountOnView(total);

  return (
    <div
      ref={containerReference}
      className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-border px-4 py-3.5"
    >
      <p className="text-sm leading-snug text-muted-foreground">{label}</p>
      <Count count={revealed} className="font-heading text-2xl font-semibold" />
    </div>
  );
}
