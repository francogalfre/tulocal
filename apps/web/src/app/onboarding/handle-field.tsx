"use client";

import { Label } from "@tulocal/ui/components/label";
import { Spinner } from "@tulocal/ui/components/spinner";
import { cn } from "@tulocal/ui/lib/utils";

import type { HandleAvailability } from "@/app/onboarding/use-handle-availability";

const STATUS_COPY: Record<HandleAvailability, { hint: string; badge: string | null }> = {
  empty: { hint: "se arma solo con el nombre, pero lo podés cambiar.", badge: null },
  invalid: { hint: "solo letras, números y guiones, entre 3 y 30.", badge: null },
  checking: { hint: "viendo si está libre…", badge: null },
  available: { hint: "ese link es tuyo.", badge: "libre" },
  taken: { hint: "alguien ya lo tiene. probá con otro.", badge: "usado" },
  unchecked: { hint: "no pudimos chequearlo ahora, lo vemos al crear.", badge: null },
};

export function HandleField({
  value,
  availability,
  onChange,
}: {
  value: string;
  availability: HandleAvailability;
  onChange: (handle: string) => void;
}) {
  const status = STATUS_COPY[availability];
  const invalid = availability === "invalid" || availability === "taken";

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="handle">tu link</Label>
      <div
        className={cn(
          "flex h-11 items-center gap-1 rounded-lg border border-input px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          invalid &&
            "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        )}
      >
        <span className="shrink-0 text-muted-foreground">tutienda/</span>
        <input
          id="handle"
          name="handle"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby="handle-hint"
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none"
        />
        {availability === "checking" && <Spinner className="text-muted-foreground" />}
        {status.badge && (
          <span
            className={cn(
              "shrink-0 text-label font-medium",
              availability === "available" ? "text-pasto-deep" : "text-warning-deep",
            )}
          >
            {status.badge}
          </span>
        )}
      </div>
      <p
        id="handle-hint"
        className={cn("text-label", invalid ? "text-warning-deep" : "text-muted-foreground")}
      >
        {status.hint}
      </p>
    </div>
  );
}
