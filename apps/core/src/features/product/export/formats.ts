import type { scenes } from "@tulocal/database/schema/scenes";

export type SceneFormat = (typeof scenes.$inferSelect)["format"];

export type ExportSource = "photo" | "generated";

type ExportFormat = {
  width: number;
  height: number;
  aspectRatio: "9:16" | "1:1";
  label: string;
};

export const STORY_SAFE_ZONE_IN_PIXELS = 250;

export const EXPORT_FORMATS: Record<SceneFormat, ExportFormat> = {
  story: { width: 1080, height: 1920, aspectRatio: "9:16", label: "Historia" },
  carousel: { width: 1080, height: 1080, aspectRatio: "1:1", label: "Carrusel" },
};
