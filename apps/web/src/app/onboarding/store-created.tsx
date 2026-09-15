"use client";

import { Button } from "@tulocal/ui/components/button";
import Link from "next/link";
import { useState } from "react";

import type { CreatedStore } from "@/app/onboarding/create-store-form";
import { getAppUrl } from "@/lib/app-url";

const COPY_FEEDBACK_MS = 2000;

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Record<CopyState, string> = {
  idle: "copiar link",
  copied: "copiado",
  failed: "no se pudo copiar",
};

export function StoreCreated({ store }: { store: CreatedStore }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const storeUrl = `${getAppUrl()}/s/${store.slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), COPY_FEEDBACK_MS);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-title">listo, ya tenés tienda.</h1>
      <p className="animate-rise font-display text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] break-words text-pasto-deep sm:w-max sm:max-w-[720px] sm:text-featured">
        <span className="text-muted-foreground">tutienda/</span>
        <span className="inline-block">{store.slug}</span>
      </p>
      <p>todavía no tiene nada. subí fotos de lo primero que quieras vender.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
          subir mi primer producto
        </Button>
        <Button size="lg" variant="outline" onClick={copyLink} aria-live="polite">
          {COPY_LABEL[copyState]}
        </Button>
      </div>
    </div>
  );
}
