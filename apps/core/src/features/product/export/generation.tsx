"use client";

import Link from "next/link";

import { tulocalIcons } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Pending } from "@/features/product/export/pending";
import { requestScene } from "@/features/product/export/request";
import type { ExportableProduct } from "@/features/product/export/exportable";
import type { SceneFormat } from "@/features/product/export/formats";

const GENERATE_LABELS: Record<SceneFormat, string> = {
  story: "Generar escena para la historia",
  carousel: "Generar escena para el carrusel",
};

type Scene = ExportableProduct["scenes"][number];

type GenerationProps = {
  productId: string;
  format: SceneFormat;
  scene: Scene | null;
  canGenerateScenes: boolean;
};

function LockedGeneration() {
  return (
    <div className="flex flex-col gap-3">
      <Button size="xl" className="w-full" render={<Link href="/plans" />} nativeButton={false}>
        <tulocalIcons.imageAdd data-icon="inline-start" />
        Pasate a Pro para generar escenas
      </Button>
      <p className="text-sm text-muted-foreground">
        Con Pro la IA pone tu producto en una escena lista para historias y carruseles. Con tus
        fotos podés exportar gratis.
      </p>
    </div>
  );
}

export function Generation({ productId, format, scene, canGenerateScenes }: GenerationProps) {
  if (!canGenerateScenes) {
    return <LockedGeneration />;
  }

  if (scene !== null && scene.status === "pending") {
    return <Pending />;
  }

  const isReady = scene !== null && scene.status === "ready";

  return (
    <div className="flex flex-col gap-3">
      {scene !== null && scene.status === "failed" && scene.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{scene.error}</AlertDescription>
        </Alert>
      ) : null}
      <form action={requestScene}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="format" value={format} />
        <Button type="submit" size="xl" variant={isReady ? "ghost" : "default"} className="w-full">
          <tulocalIcons.imageAdd data-icon="inline-start" />
          {isReady ? "Generar otra escena" : GENERATE_LABELS[format]}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        La escena la genera la IA con tu foto. El producto no cambia, solo el fondo.
      </p>
    </div>
  );
}
