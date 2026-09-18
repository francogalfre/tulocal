"use client";

import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EXPORT_FORMATS } from "@/features/product/export/formats";
import { Generation } from "@/features/product/export/generation";
import { Piece } from "@/features/product/export/piece";
import type { ExportableProduct } from "@/features/product/export/exportable";
import type { ExportSource, SceneFormat } from "@/features/product/export/formats";

const CAROUSEL_SLIDES = ["1", "2", "3"] as const;

const PRESSED_ITEM_CLASS_NAME =
  "px-4 aria-pressed:bg-brand-deep aria-pressed:text-white aria-pressed:hover:bg-brand-deep";

const SOURCE_LABELS: Record<ExportSource, string> = {
  photo: "Con tus fotos",
  generated: "Escena con IA",
};

type ExporterProps = {
  productId: string;
  scenes: ExportableProduct["scenes"];
  canGenerateScenes: boolean;
};

type PieceDescription = {
  key: string;
  label: string;
  url: string;
  fileName: string;
  format: SceneFormat;
};

type DescribePiecesInput = {
  productId: string;
  format: SceneFormat;
  source: ExportSource;
  version: string | null;
};

function isSceneFormat(value: string): value is SceneFormat {
  return Object.hasOwn(EXPORT_FORMATS, value);
}

function isExportSource(value: string): value is ExportSource {
  return Object.hasOwn(SOURCE_LABELS, value);
}

function describePieces(input: DescribePiecesInput): PieceDescription[] {
  const query =
    input.version === null
      ? `scene=${input.source}`
      : `scene=${input.source}&version=${input.version}`;
  const basePath = `/product/${input.productId}/export`;

  if (input.format === "story") {
    return [
      {
        key: "story",
        label: EXPORT_FORMATS.story.label,
        url: `${basePath}/story?${query}`,
        fileName: "historia.png",
        format: "story",
      },
    ];
  }

  return CAROUSEL_SLIDES.map((slide) => ({
    key: `carousel-${slide}`,
    label: `${EXPORT_FORMATS.carousel.label} ${slide} de ${CAROUSEL_SLIDES.length}`,
    url: `${basePath}/carousel?slide=${slide}&${query}`,
    fileName: `carrusel-${slide}.png`,
    format: "carousel",
  }));
}

export function Exporter({ productId, scenes, canGenerateScenes }: ExporterProps) {
  const [format, setFormat] = useState<SceneFormat>("story");
  const [source, setSource] = useState<ExportSource>("photo");
  const scene = scenes.find((candidate) => candidate.format === format) ?? null;
  const isSceneReady = scene !== null && scene.status === "ready";
  const isShowingPieces = source === "photo" || isSceneReady;
  const version = scene === null ? null : String(scene.updatedAt.getTime());
  const pieces = describePieces({ productId, format, source, version });

  function handleFormatChange(groupValue: string[]): void {
    const [next] = groupValue;

    if (next !== undefined && isSceneFormat(next)) {
      setFormat(next);
    }
  }

  function handleSourceChange(groupValue: string[]): void {
    const [next] = groupValue;

    if (next !== undefined && isExportSource(next)) {
      setSource(next);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">Formato</span>
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[format]}
            onValueChange={handleFormatChange}
          >
            <ToggleGroupItem value="story" className={PRESSED_ITEM_CLASS_NAME}>
              {EXPORT_FORMATS.story.label}
            </ToggleGroupItem>
            <ToggleGroupItem value="carousel" className={PRESSED_ITEM_CLASS_NAME}>
              {EXPORT_FORMATS.carousel.label}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">Imagen</span>
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[source]}
            onValueChange={handleSourceChange}
          >
            <ToggleGroupItem value="photo" className={PRESSED_ITEM_CLASS_NAME}>
              {SOURCE_LABELS.photo}
            </ToggleGroupItem>
            <ToggleGroupItem value="generated" className={PRESSED_ITEM_CLASS_NAME}>
              {SOURCE_LABELS.generated}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      {source === "generated" ? (
        <Generation
          productId={productId}
          format={format}
          scene={scene}
          canGenerateScenes={canGenerateScenes}
        />
      ) : null}
      {isShowingPieces ? (
        <div className={format === "story" ? "max-w-xs" : "grid gap-4 sm:grid-cols-3"}>
          {pieces.map((piece) => (
            <Piece
              key={piece.key}
              label={piece.label}
              url={piece.url}
              fileName={piece.fileName}
              format={piece.format}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
