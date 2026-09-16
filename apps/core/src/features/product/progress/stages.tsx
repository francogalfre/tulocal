"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Spinner } from "@/components/ui/spinner";
import { Count } from "@/components/count";
import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import { useElapsedSeconds } from "@/features/product/progress/elapsed";
import { EASE_OUT_EXPO, STATE_DURATION_IN_SECONDS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import type { OwnedProduct } from "@/features/product/find";

const REFRESH_INTERVAL_IN_MILLISECONDS = 2000;

const PROGRESS_FILL_DURATION_IN_SECONDS = 0.7;

const MARKER_START_SCALE = 0.5;

type StageStatus = "pending" | "running" | "done";

type Stage = {
  key: string;
  label: string;
  hint: string;
  status: StageStatus;
  summary: ReactNode;
};

type StageMarkerProps = {
  status: StageStatus;
};

type StagesProps = {
  product: OwnedProduct;
};

function describeIdentification(product: OwnedProduct): string | null {
  const parts = [
    product.category === null ? null : CATEGORY_LABELS[product.category],
    product.brand,
    product.condition === null ? null : CONDITION_LABELS[product.condition],
  ].filter((part) => part !== null);

  return parts.length === 0 ? null : parts.join(" · ");
}

function resolveParallelStatus(product: OwnedProduct, isDone: boolean): StageStatus {
  if (product.pipelineStage === "identifying") {
    return "pending";
  }

  return isDone ? "done" : "running";
}

function describeStages(product: OwnedProduct): Stage[] {
  const generatedCount = product.images.filter((image) => image.kind !== "original").length;

  return [
    {
      key: "identifying",
      label: "Identificando el producto",
      hint: "Marca, modelo, categoría y estado",
      status: product.pipelineStage === "identifying" ? "running" : "done",
      summary: describeIdentification(product),
    },
    {
      key: "imaging",
      label: "Mejorando las fotos",
      hint: "Fondo blanco, en contexto y editorial",
      status: resolveParallelStatus(product, generatedCount > 0),
      summary:
        generatedCount === 0 ? null : (
          <>
            <Count count={generatedCount} /> fotos nuevas
          </>
        ),
    },
    {
      key: "writing",
      label: "Escribiendo título y descripción",
      hint: "En castellano, corto y sin chamuyo",
      status: resolveParallelStatus(product, product.title !== null),
      summary: product.title,
    },
    {
      key: "researching",
      label: "Buscando precios parecidos",
      hint: "Mercado Libre y Facebook Marketplace",
      status: resolveParallelStatus(product, product.pipelineStage === "completed"),
      summary: null,
    },
  ];
}

function StageMarker({ status }: StageMarkerProps) {
  if (status === "done") {
    return (
      <motion.span
        initial={{ scale: MARKER_START_SCALE, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: STATE_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
        className="flex size-6 items-center justify-center rounded-full bg-brand-deep text-white"
      >
        <Check className="size-3.5" />
      </motion.span>
    );
  }

  if (status === "running") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full border border-brand-deep">
        <Spinner className="size-3.5 text-brand-deep" />
      </span>
    );
  }

  return <span className="size-6 rounded-full border border-border" />;
}

export function Stages({ product }: StagesProps) {
  const router = useRouter();
  const stages = describeStages(product);
  const doneCount = stages.filter((stage) => stage.status === "done").length;
  const elapsedSeconds = useElapsedSeconds(product.createdAt);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), REFRESH_INTERVAL_IN_MILLISECONDS);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            <Count count={doneCount} /> de <Count count={stages.length} /> listos
          </span>
          <span>
            <Count count={elapsedSeconds} /> s
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={false}
            animate={{ scaleX: doneCount / stages.length }}
            transition={{ duration: PROGRESS_FILL_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
            className="h-full origin-left rounded-full bg-brand-deep"
          />
        </div>
      </div>
      <ol className="flex flex-col">
        {stages.map((stage, index) => (
          <li key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <StageMarker status={stage.status} />
              {index < stages.length - 1 ? (
                <span
                  className={cn(
                    "my-1 w-px flex-1 transition-colors duration-500",
                    stage.status === "done" ? "bg-brand-deep" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div
              className={cn("flex min-w-0 flex-col gap-0.5", index < stages.length - 1 && "pb-6")}
            >
              <span
                className={cn(
                  "font-medium transition-colors duration-300",
                  stage.status === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {stage.label}
              </span>
              {stage.status === "running" ? (
                <span className="text-sm text-muted-foreground">{stage.hint}</span>
              ) : null}
              {stage.status === "done" && stage.summary !== null ? (
                <Reveal className="truncate text-sm text-muted-foreground">{stage.summary}</Reveal>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
