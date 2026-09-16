import { Brand } from "@/features/opengraph/brand";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { truncateForPreview } from "@/features/opengraph/truncate";
import { Frame, FRAME_INSET } from "@/features/product/export/pieces/frame";
import { Price } from "@/features/product/export/pieces/price";

const TITLE_MAX_CHARACTERS = 70;

const CONTENT_PADDING = 96;

type ClosingPieceProps = {
  title: string;
  priceInArs: number;
};

export function ClosingPiece({ title, priceInArs }: ClosingPieceProps) {
  return (
    <Frame format="carousel">
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: CONTENT_PADDING,
          textAlign: "center",
        }}
      >
        <Price amountInArs={priceInArs} fontSize={160} />
        <span
          style={{
            fontFamily: "Outfit",
            fontSize: 56,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: OPENGRAPH_PALETTE.ink,
          }}
        >
          {truncateForPreview(title, TITLE_MAX_CHARACTERS)}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: FRAME_INSET,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Brand markSize={40} fontSize={44} />
      </div>
    </Frame>
  );
}
