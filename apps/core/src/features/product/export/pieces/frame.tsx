import type { ReactNode } from "react";

import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { EXPORT_FORMATS } from "@/features/product/export/formats";
import type { SceneFormat } from "@/features/product/export/formats";

export const FRAME_INSET = 64;

type FrameProps = {
  format: SceneFormat;
  children: ReactNode;
};

export function Frame({ format, children }: FrameProps) {
  const { width, height } = EXPORT_FORMATS[format];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width,
        height,
        overflow: "hidden",
        backgroundColor: OPENGRAPH_PALETTE.paper,
        fontFamily: "Plus Jakarta Sans",
        color: OPENGRAPH_PALETTE.ink,
      }}
    >
      {children}
    </div>
  );
}
