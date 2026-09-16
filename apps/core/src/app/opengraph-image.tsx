import { ImageResponse } from "next/og";

import { loadOpengraphAssets } from "@/features/opengraph/assets";
import { Brand } from "@/features/opengraph/brand";
import { Canvas, OPENGRAPH_CONTENT_TYPE, OPENGRAPH_SIZE } from "@/features/opengraph/canvas";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";

export const alt = "tulocal. Una foto y ya estás vendiendo.";

export const size = OPENGRAPH_SIZE;

export const contentType = OPENGRAPH_CONTENT_TYPE;

export default async function Image() {
  const assets = await loadOpengraphAssets();

  return new ImageResponse(
    <Canvas skylineUrl={assets.skylineUrl}>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Brand markSize={56} fontSize={64} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            fontFamily: "Outfit",
            fontSize: 52,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: OPENGRAPH_PALETTE.ink,
          }}
        >
          <span>Una foto y</span>
          <span>ya estás vendiendo</span>
          <span
            style={{
              marginTop: 20,
              fontFamily: "Plus Jakarta Sans",
              fontSize: 26,
              letterSpacing: 0,
              color: OPENGRAPH_PALETTE.muted,
            }}
          >
            Gratis, sin comisión.
          </span>
        </div>
      </div>
    </Canvas>,
    { ...size, fonts: assets.fonts },
  );
}
