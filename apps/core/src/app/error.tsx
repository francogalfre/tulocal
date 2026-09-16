"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Screen } from "@/components/screen";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Algo salió mal</EmptyTitle>
            <EmptyDescription>Probá de nuevo en un momento.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div className="flex flex-col gap-3">
          <Button size="xl" onClick={reset}>
            Reintentar
          </Button>
          <Button size="xl" variant="ghost" render={<Link href="/" />} nativeButton={false}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </Screen>
  );
}
