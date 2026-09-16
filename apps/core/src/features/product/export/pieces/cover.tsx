import { Brand } from "@/features/opengraph/brand";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { EXPORT_FORMATS } from "@/features/product/export/formats";
import { Frame, FRAME_INSET } from "@/features/product/export/pieces/frame";
import { Price } from "@/features/product/export/pieces/price";

const BAND_HEIGHT = 240;

type CoverPieceProps = {
  imageUrl: string;
  priceInArs: number;
};

export function CoverPiece({ imageUrl, priceInArs }: CoverPieceProps) {
  const { width, height } = EXPORT_FORMATS.carousel;

  return (
    <Frame format="carousel">
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ position: "relative", display: "flex", flex: 1, overflow: "hidden" }}>
          <img
            src={imageUrl}
            width={width}
            height={height}
            style={{ position: "absolute", left: 0, bottom: 0, width, height, objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: BAND_HEIGHT,
            paddingLeft: FRAME_INSET,
            paddingRight: FRAME_INSET,
            backgroundColor: OPENGRAPH_PALETTE.paper,
          }}
        >
          <Price amountInArs={priceInArs} fontSize={96} />
          <Brand markSize={40} fontSize={44} />
        </div>
      </div>
    </Frame>
  );
}
