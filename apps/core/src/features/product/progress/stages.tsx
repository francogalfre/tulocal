"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { OwnedProduct } from "@/features/product/find";

const REFRESH_INTERVAL_IN_MILLISECONDS = 2000;

const STAGES = [
  { key: "identifying", label: "Identificando el producto" },
  { key: "imaging", label: "Mejorando las fotos" },
  { key: "writing", label: "Escribiendo título y descripción" },
  { key: "researching", label: "Buscando precios parecidos" },
] as const;

type StagesProps = {
  currentStage: OwnedProduct["pipelineStage"];
};

export function Stages({ currentStage }: StagesProps) {
  const router = useRouter();
  const currentIndex = STAGES.findIndex((stage) => stage.key === currentStage);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), REFRESH_INTERVAL_IN_MILLISECONDS);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <ol className="flex flex-col gap-3">
      {STAGES.map((stage, index) => {
        const isDone = currentStage === "completed" || index < currentIndex;
        const isCurrent = !isDone && index >= currentIndex;

        return (
          <li
            key={stage.key}
            className={cn(
              "flex items-center gap-3 transition-colors duration-300",
              isDone || isCurrent ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="flex size-5 items-center justify-center">
              {isDone ? (
                <Check className="size-4 text-brand-deep motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300" />
              ) : null}
              {isCurrent ? <Spinner className="text-brand-deep" /> : null}
            </span>
            {stage.label}
          </li>
        );
      })}
    </ol>
  );
}
