"use client";

import Link from "next/link";

import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function ErrorIllustration() {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className="size-28">
      <rect x="0" y="0" width="20" height="20" rx="6" className="fill-brand" />
      <rect x="24" y="0" width="20" height="20" rx="6" className="fill-brand-deep" />
      <rect x="0" y="24" width="20" height="20" rx="6" className="fill-brand-deep" />
      <rect
        x="30"
        y="34"
        width="20"
        height="20"
        rx="6"
        transform="rotate(24 40 44)"
        className="fill-brand/50"
      />
    </svg>
  );
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <ErrorIllustration />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Algo salió mal</h1>
          <p className="max-w-sm text-muted-foreground">
            Tuvimos un problema al cargar esta página. Probá de nuevo en un momento.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button size="xl" onClick={reset}>
            Reintentar
          </Button>
          <Button size="lg" variant="ghost" render={<Link href="/" />} nativeButton={false}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </Screen>
  );
}
