"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";

const REFRESH_INTERVAL_IN_MILLISECONDS = 2000;

export function Pending() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), REFRESH_INTERVAL_IN_MILLISECONDS);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground">
      <Spinner className="size-4 text-brand-deep" />
      Armando la escena, tarda unos segundos
    </div>
  );
}
