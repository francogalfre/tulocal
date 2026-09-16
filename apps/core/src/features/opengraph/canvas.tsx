import type { ReactNode } from "react";

import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";

export const OPENGRAPH_SIZE = { width: 1200, height: 630 } as const;

export const OPENGRAPH_CONTENT_TYPE = "image/png";

const CANVAS_PADDING = 64;

type CanvasProps = {
  skylineUrl: string | null;
  children: ReactNode;
};

export function Canvas({ skylineUrl, children }: CanvasProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: OPENGRAPH_SIZE.width,
        height: OPENGRAPH_SIZE.height,
        backgroundColor: OPENGRAPH_PALETTE.paper,
        fontFamily: "Plus Jakarta Sans",
        color: OPENGRAPH_PALETTE.ink,
      }}
    >
      {skylineUrl !== null ? (
        <img
          src={skylineUrl}
          width={OPENGRAPH_SIZE.width}
          height={OPENGRAPH_SIZE.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          width: OPENGRAPH_SIZE.width,
          height: OPENGRAPH_SIZE.height,
          padding: CANVAS_PADDING,
        }}
      >
        {children}
      </div>
    </div>
  );
}
