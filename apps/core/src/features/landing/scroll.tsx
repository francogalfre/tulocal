"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

const SCROLL_OPTIONS = {
  duration: 1.05,
  easing: easeOutExponential,
  wheelMultiplier: 1,
  touchMultiplier: 1.6,
  syncTouch: false,
  anchors: true,
};

type SmoothScrollProps = {
  children: ReactNode;
};

function easeOutExponential(progress: number): number {
  return Math.min(1, 1.001 - 2 ** (-10 * progress));
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis root options={SCROLL_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
