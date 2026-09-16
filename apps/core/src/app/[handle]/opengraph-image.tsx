import { ImageResponse } from "next/og";

import { loadOpengraphAssets } from "@/features/opengraph/assets";
import { Brand } from "@/features/opengraph/brand";
import { Canvas, OPENGRAPH_CONTENT_TYPE, OPENGRAPH_SIZE } from "@/features/opengraph/canvas";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { truncateForPreview } from "@/features/opengraph/truncate";
import { findPublicStore } from "@/features/store/public";

type StoreImageProps = {
  params: Promise<{ handle: string }>;
};

const STORE_NAME_MAX_CHARACTERS = 36;

export const alt = "Tienda en tulocal";

export const size = OPENGRAPH_SIZE;

export const contentType = OPENGRAPH_CONTENT_TYPE;

function describeStore(productCount: number): string {
  if (productCount === 1) {
    return "1 producto publicado";
  }

  return `${productCount} productos publicados`;
}

export default async function Image({ params }: StoreImageProps) {
  const { handle } = await params;
  const [assets, store] = await Promise.all([loadOpengraphAssets(), findPublicStore(handle)]);
  const storeName =
    store === null ? "tulocal" : truncateForPreview(store.name, STORE_NAME_MAX_CHARACTERS);
  const storeLine = store === null ? "Tienda no encontrada" : describeStore(store.products.length);

  return new ImageResponse(
    <Canvas skylineUrl={assets.skylineUrl}>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 48,
        }}
      >
        <Brand markSize={56} fontSize={64} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            maxWidth: 760,
            textAlign: "right",
          }}
        >
          <span
            style={{
              fontFamily: "Outfit",
              fontSize: 60,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: OPENGRAPH_PALETTE.ink,
            }}
          >
            {storeName}
          </span>
          <span
            style={{
              marginTop: 16,
              fontSize: 26,
              lineHeight: 1.4,
              color: OPENGRAPH_PALETTE.muted,
            }}
          >
            {storeLine}
          </span>
        </div>
      </div>
    </Canvas>,
    { ...size, fonts: assets.fonts },
  );
}
