import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";
import { formatArs } from "@/lib/money";

type PriceProps = {
  amountInArs: number;
  fontSize: number;
};

export function Price({ amountInArs, fontSize }: PriceProps) {
  return (
    <span
      style={{
        fontFamily: "Outfit",
        fontSize,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: OPENGRAPH_PALETTE.accentDeep,
      }}
    >
      {formatArs(amountInArs)}
    </span>
  );
}
