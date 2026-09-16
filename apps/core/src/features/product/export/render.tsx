import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

import { loadOpengraphAssets } from "@/features/opengraph/assets";
import { EXPORT_FORMATS } from "@/features/product/export/formats";
import type { SceneFormat } from "@/features/product/export/formats";

export type RenderPieceInput = {
  format: SceneFormat;
  fileName: string;
  element: ReactElement;
};

export async function renderPiece(input: RenderPieceInput): Promise<ImageResponse> {
  const assets = await loadOpengraphAssets();
  const { width, height } = EXPORT_FORMATS[input.format];

  return new ImageResponse(input.element, {
    width,
    height,
    fonts: assets.fonts,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${input.fileName}"`,
    },
  });
}
