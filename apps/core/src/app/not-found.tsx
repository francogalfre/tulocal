import type { Metadata } from "next";
import Link from "next/link";

import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

function NotFoundIllustration() {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className="size-28">
      <rect x="0" y="0" width="20" height="20" rx="6" className="fill-brand" />
      <rect x="24" y="0" width="20" height="20" rx="6" className="fill-brand-deep" />
      <rect x="0" y="24" width="20" height="20" rx="6" className="fill-brand-deep" />
      <rect x="32" y="32" width="20" height="20" rx="6" className="fill-brand" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <NotFoundIllustration />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">No encontramos esa página</h1>
          <p className="max-w-sm text-muted-foreground">
            Puede que el link esté roto o que la página ya no exista.
          </p>
        </div>
        <Button size="xl" render={<Link href="/" />} nativeButton={false}>
          Volver al inicio
        </Button>
      </div>
    </Screen>
  );
}
