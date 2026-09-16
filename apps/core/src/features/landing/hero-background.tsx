import { cn } from "cn";
import type { ReactNode } from "react";

type HeroBackgroundProps = {
  children: ReactNode;
  className?: string;
};

const ARC_FADE_MASK = "[mask-image:linear-gradient(to_bottom,black_40%,transparent_85%)]";

export function HeroBackground({ children, className }: HeroBackgroundProps) {
  return (
    <div
      data-slot="hero-background"
      className={cn("relative isolate overflow-hidden bg-background", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#f6f4ec_0%,#efebdd_100%)]"
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-[28%] left-1/2 -z-10 h-[92%] w-[150%] -translate-x-1/2 rounded-[100%] ${ARC_FADE_MASK} [background:radial-gradient(ellipse_120%_88%_at_50%_100%,rgba(34,197,94,0.45)_0%,rgba(21,128,61,0.36)_20%,rgba(34,197,94,0.20)_46%,rgba(239,235,221,0)_78%)]`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-[22%] left-1/2 -z-10 h-[78%] w-[128%] -translate-x-1/2 rounded-[100%] blur-2xl ${ARC_FADE_MASK} [background:radial-gradient(ellipse_110%_80%_at_50%_100%,rgba(34,197,94,0.24)_0%,rgba(21,128,61,0.15)_26%,rgba(239,235,221,0.10)_52%,transparent_84%)]`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-[18%] left-1/2 -z-10 h-[64%] w-[108%] -translate-x-1/2 rounded-[100%] blur-3xl ${ARC_FADE_MASK} [background:radial-gradient(ellipse_100%_72%_at_50%_100%,rgba(255,255,255,0.45)_0%,rgba(246,244,236,0.14)_40%,transparent_72%)]`}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_center,#14231a_1px,transparent_1px)] [background-size:4px_4px] opacity-[0.03]"
      />

      {children}
    </div>
  );
}
