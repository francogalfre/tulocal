import { Brand } from "@/features/opengraph/brand";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { Backdrop } from "@/features/product/export/pieces/backdrop";
import { Frame, FRAME_INSET } from "@/features/product/export/pieces/frame";

const BADGE_RADIUS = 999;

type ScenePieceProps = {
  imageUrl: string;
};

export function ScenePiece({ imageUrl }: ScenePieceProps) {
  return (
    <Frame format="carousel">
      <Backdrop format="carousel" imageUrl={imageUrl} />
      <div
        style={{
          position: "absolute",
          right: FRAME_INSET,
          bottom: FRAME_INSET,
          display: "flex",
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: BADGE_RADIUS,
          backgroundColor: OPENGRAPH_PALETTE.paper,
        }}
      >
        <Brand markSize={36} fontSize={40} />
      </div>
    </Frame>
  );
}
