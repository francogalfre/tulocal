import { Brand } from "@/features/opengraph/brand";
import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { truncateForPreview } from "@/features/opengraph/truncate";
import { STORY_SAFE_ZONE_IN_PIXELS } from "@/features/product/export/formats";
import { Frame, FRAME_INSET } from "@/features/product/export/pieces/frame";
import { Price } from "@/features/product/export/pieces/price";

const TITLE_MAX_CHARACTERS = 60;

const PHOTO_RADIUS = 48;

type StoryPieceProps = {
  imageUrl: string;
  title: string;
  priceInArs: number;
};

export function StoryPiece({ imageUrl, title, priceInArs }: StoryPieceProps) {
  return (
    <Frame format="story">
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            borderBottomLeftRadius: PHOTO_RADIUS,
            borderBottomRightRadius: PHOTO_RADIUS,
          }}
        >
          <img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            paddingTop: 56,
            paddingLeft: FRAME_INSET,
            paddingRight: FRAME_INSET,
            paddingBottom: STORY_SAFE_ZONE_IN_PIXELS + FRAME_INSET,
          }}
        >
          <Price amountInArs={priceInArs} fontSize={112} />
          <span
            style={{
              fontFamily: "Outfit",
              fontSize: 52,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: OPENGRAPH_PALETTE.ink,
            }}
          >
            {truncateForPreview(title, TITLE_MAX_CHARACTERS)}
          </span>
          <Brand markSize={40} fontSize={44} />
        </div>
      </div>
    </Frame>
  );
}
