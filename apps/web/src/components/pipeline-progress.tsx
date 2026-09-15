"use client";

import { Button } from "@tulocal/ui/components/button";
import { Spinner } from "@tulocal/ui/components/spinner";
import { Check, Circle, RefreshCw, X } from "lucide-react";

import { ImageBadge } from "./image-badge";

type StepState = "pending" | "running" | "done" | "failed";
type PipelineSteps = { analyze: StepState; images: StepState; prices: StepState };

const LABELS: Record<keyof PipelineSteps, string> = {
  analyze: "Analizando las fotos",
  images: "Generando imágenes para vender",
  prices: "Buscando precios de mercado",
};

function StepIcon({ state }: { state: StepState }) {
  if (state === "running") return <Spinner className="size-4" />;
  if (state === "done") return <Check className="size-4 text-green-600" />;
  if (state === "failed") return <X className="size-4 text-destructive" />;
  return <Circle className="size-4 text-muted-foreground/50" />;
}

export function PipelineProgress({
  status,
  stage,
  steps,
  error,
  title,
  images,
  onRetry,
  retrying,
}: {
  status: "processing" | "ready" | "failed";
  stage: string;
  steps: PipelineSteps;
  error: string | null;
  title: string | null;
  images: {
    id: string;
    url: string;
    kind: "original" | "studio" | "lifestyle" | "enhanced" | "hero";
    fidelityPassed: boolean | null;
  }[];
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {title ?? (status === "failed" ? "No pudimos procesarlo" : "Preparando tu publicación…")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {status === "failed"
            ? "Algo falló en el camino. Podés reintentar."
            : "Esto tarda alrededor de un minuto. Las imágenes van apareciendo a medida que salen."}
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {(Object.keys(LABELS) as (keyof PipelineSteps)[]).map((key) => (
          <li key={key} className="flex items-center gap-2 text-sm">
            <StepIcon state={steps[key]} />
            <span className={steps[key] === "pending" ? "text-muted-foreground" : ""}>
              {LABELS[key]}
            </span>
          </li>
        ))}
      </ol>

      {(status === "failed" || stage === "uploading") && (
        <div className="flex flex-col gap-2 border p-3 text-sm">
          {error && <p className="text-destructive">{error}</p>}
          {stage === "uploading" && status !== "failed" && (
            <p className="text-muted-foreground">Si no arranca en unos segundos, reintentá.</p>
          )}
          <div>
            <Button size="sm" variant="outline" onClick={onRetry} disabled={retrying}>
              <RefreshCw data-icon="inline-start" />
              {retrying ? "Reintentando…" : "Reintentar"}
            </Button>
          </div>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <li key={image.id} className="relative aspect-square overflow-hidden bg-muted">
            <img src={image.url} alt="" className="size-full object-cover" />
            <ImageBadge kind={image.kind} fidelityPassed={image.fidelityPassed} />
          </li>
        ))}
        {status === "processing" &&
          steps.images !== "done" &&
          Array.from({
            length: Math.max(0, 4 - images.filter((i) => i.kind !== "original").length),
          }).map((_, index) => (
            <li
              key={`placeholder-${index}`}
              className="flex aspect-square animate-pulse items-center justify-center bg-muted text-xs text-muted-foreground"
            >
              {steps.images === "running" ? "Generando…" : ""}
            </li>
          ))}
      </ul>
    </div>
  );
}
