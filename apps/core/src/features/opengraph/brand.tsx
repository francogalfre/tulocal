import { OPENGRAPH_PALETTE } from "@/features/opengraph/palette";

type BrandProps = {
  markSize: number;
  fontSize: number;
};

export function Brand({ markSize, fontSize }: BrandProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: markSize * 0.4 }}>
      <svg viewBox="0 0 20 20" width={markSize} height={markSize}>
        <rect x="0" y="0" width="9" height="9" rx="2.5" fill={OPENGRAPH_PALETTE.accent} />
        <rect x="11" y="0" width="9" height="9" rx="2.5" fill={OPENGRAPH_PALETTE.accentDeep} />
        <rect x="0" y="11" width="9" height="9" rx="2.5" fill={OPENGRAPH_PALETTE.accentDeep} />
        <rect x="11" y="11" width="9" height="9" rx="2.5" fill={OPENGRAPH_PALETTE.accent} />
      </svg>
      <span
        style={{
          fontFamily: "Outfit",
          fontWeight: 600,
          fontSize,
          letterSpacing: "-0.02em",
          color: OPENGRAPH_PALETTE.ink,
        }}
      >
        tulocal
      </span>
    </div>
  );
}
