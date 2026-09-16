import { ImageResponse } from "next/og";

import { loadOpengraphAssets } from "@/features/opengraph/assets";
import { Brand } from "@/features/opengraph/brand";
import { Canvas, OPENGRAPH_CONTENT_TYPE, OPENGRAPH_SIZE } from "@/features/opengraph/canvas";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { truncateForPreview } from "@/features/opengraph/truncate";
import { CONDITION_LABELS } from "@/features/product/condition";
import { findPublicProduct } from "@/features/product/public";
import { selectCoverUrl } from "@/features/store/catalog";
import { formatArs } from "@/lib/money";

type ProductImageProps = {
  params: Promise<{ handle: string; productId: string }>;
};

const COVER_SIZE = 502;

const TITLE_MAX_CHARACTERS = 70;

export const alt = "Producto en tulocal";

export const size = OPENGRAPH_SIZE;

export const contentType = OPENGRAPH_CONTENT_TYPE;

export default async function Image({ params }: ProductImageProps) {
  const { handle, productId } = await params;
  const [assets, product] = await Promise.all([
    loadOpengraphAssets(),
    findPublicProduct(handle, productId),
  ]);

  if (product === null) {
    return new ImageResponse(
      <Canvas skylineUrl={assets.skylineUrl}>
        <Brand markSize={56} fontSize={64} />
      </Canvas>,
      { ...size, fonts: assets.fonts },
    );
  }

  const coverUrl = selectCoverUrl(product.images);
  const title = truncateForPreview(product.title ?? "Producto", TITLE_MAX_CHARACTERS);
  const condition = product.condition === null ? null : CONDITION_LABELS[product.condition];

  return new ImageResponse(
    <Canvas skylineUrl={null}>
      <div style={{ display: "flex", width: "100%", height: "100%", gap: 56 }}>
        {coverUrl !== null ? (
          <img
            src={coverUrl}
            width={COVER_SIZE}
            height={COVER_SIZE}
            style={{
              width: COVER_SIZE,
              height: COVER_SIZE,
              borderRadius: 24,
              objectFit: "cover",
              border: `1px solid ${OPENGRAPH_PALETTE.line}`,
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Brand markSize={36} fontSize={40} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span
              style={{
                fontFamily: "Outfit",
                fontSize: 76,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: OPENGRAPH_PALETTE.accentDeep,
              }}
            >
              {formatArs(product.listPriceInArs ?? 0)}
            </span>
            <span
              style={{
                fontFamily: "Outfit",
                fontSize: 40,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: OPENGRAPH_PALETTE.ink,
              }}
            >
              {title}
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 24, color: OPENGRAPH_PALETTE.muted }}>
            <span>{product.store.name}</span>
            {condition !== null ? <span>·</span> : null}
            {condition !== null ? <span>{condition}</span> : null}
          </div>
        </div>
      </div>
    </Canvas>,
    { ...size, fonts: assets.fonts },
  );
}
