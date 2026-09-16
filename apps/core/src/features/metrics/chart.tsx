"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

import type { DailyVisits } from "@/features/metrics/summary";

const CHART_AMOUNT = 0.3;

const BAR_DELAY_IN_MILLISECONDS = 16;

const MINIMUM_VISIBLE_PERCENT = 6;

const DAY_FORMATTER = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });

type ChartProps = {
  series: DailyVisits[];
};

function describeDay(day: string): string {
  return DAY_FORMATTER.format(new Date(`${day}T00:00:00`));
}

function describeVisits(total: number): string {
  return total === 1 ? "1 visita" : `${total} visitas`;
}

function computeBarPercent(total: number, peak: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.max((total / peak) * 100, MINIMUM_VISIBLE_PERCENT);
}

export function Chart({ series }: ChartProps) {
  const containerReference = useRef<HTMLDivElement>(null);
  const hasEntered = useInView(containerReference, { once: true, amount: CHART_AMOUNT });
  const peak = Math.max(...series.map((entry) => entry.total), 1);
  const firstDay = series.at(0);

  return (
    <div ref={containerReference} className="flex flex-col gap-3">
      <div className="flex h-28 items-end gap-1">
        {series.map((entry, index) => (
          <div
            key={entry.day}
            className="flex h-full flex-1 flex-col justify-end rounded-full bg-foreground/5"
            title={`${describeDay(entry.day)}: ${describeVisits(entry.total)}`}
          >
            <div
              className="rounded-full bg-brand-deep transition-[height] duration-700 ease-out motion-reduce:transition-none"
              style={{
                height: hasEntered ? `${computeBarPercent(entry.total, peak)}%` : "0%",
                transitionDelay: `${index * BAR_DELAY_IN_MILLISECONDS}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{firstDay === undefined ? null : describeDay(firstDay.day)}</span>
        <span>Hoy</span>
      </div>
    </div>
  );
}
