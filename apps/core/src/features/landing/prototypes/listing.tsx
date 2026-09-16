"use client";

import { cn } from "cn";
import { useEffect, useState } from "react";

import { useHasEnteredViewport } from "@/features/landing/prototypes/viewport";

const AUTOPLAY_DELAY_IN_MILLISECONDS = 700;

type GeneratedField = {
  label: string;
  value: string;
  delayClassName: string;
  placeholderClassName: string;
};

const GENERATED_FIELDS: GeneratedField[] = [
  {
    label: "Título",
    value: "Silla de madera maciza",
    delayClassName: "delay-150",
    placeholderClassName: "w-full",
  },
  {
    label: "Estado",
    value: "Usada, como nueva",
    delayClassName: "delay-300",
    placeholderClassName: "w-2/3",
  },
  {
    label: "Precio sugerido",
    value: "$85.000",
    delayClassName: "delay-500",
    placeholderClassName: "w-1/2",
  },
];

type ChairDrawingProps = {
  className?: string;
};

function ChairDrawing({ className }: ChairDrawingProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M16 5v15M32 5v15M16 11h16M12 20h24M14 20v21M34 20v21" />
    </svg>
  );
}

type StateTabProps = {
  label: string;
  isActive: boolean;
  onSelect: () => void;
};

function StateTab({ label, isActive, onSelect }: StateTabProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        isActive ? "bg-background text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function ListingPrototype() {
  const { containerRef, hasEnteredViewport } = useHasEnteredViewport();
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!hasEnteredViewport) {
      return;
    }

    const timer = setTimeout(() => setIsPublished(true), AUTOPLAY_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [hasEnteredViewport]);

  return (
    <div ref={containerRef} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex w-fit gap-1 self-start rounded-full bg-secondary p-1">
        <StateTab label="Tu foto" isActive={!isPublished} onSelect={() => setIsPublished(false)} />
        <StateTab
          label="Publicación"
          isActive={isPublished}
          onSelect={() => setIsPublished(true)}
        />
      </div>
      <div className="flex items-center gap-5">
        <div
          className={cn(
            "flex aspect-square w-28 shrink-0 items-center justify-center rounded-xl border transition-colors duration-500",
            isPublished ? "border-border bg-background" : "border-transparent bg-secondary",
          )}
        >
          <ChairDrawing
            className={cn(
              "w-3/5 transition-colors duration-500",
              isPublished ? "stroke-foreground" : "stroke-muted-foreground",
            )}
          />
        </div>
        <dl className="flex flex-1 flex-col gap-3">
          {GENERATED_FIELDS.map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="grid">
                <span
                  className={cn(
                    "col-start-1 row-start-1 h-4 self-center rounded-full bg-secondary transition-opacity duration-300",
                    field.placeholderClassName,
                    isPublished ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "col-start-1 row-start-1 text-sm font-medium transition-opacity duration-500",
                    field.delayClassName,
                    isPublished ? "opacity-100" : "opacity-0",
                  )}
                >
                  {field.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
