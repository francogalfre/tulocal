"use client";

import { Count } from "@/components/count";
import { useRevealedCountOnView } from "@/features/metrics/reveal";

type HeadlineProps = {
  label: string;
  total: number;
};

export function Headline({ label, total }: HeadlineProps) {
  const { containerReference, revealed } = useRevealedCountOnView(total);

  return (
    <div ref={containerReference} className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Count count={revealed} className="font-heading text-5xl font-semibold text-brand-deep" />
    </div>
  );
}
