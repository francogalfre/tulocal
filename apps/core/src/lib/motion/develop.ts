import type { Variants } from "motion/react";

import { DEVELOP_DURATION_IN_SECONDS, EASE_OUT_EXPO } from "@/lib/motion/timing";

const UNDEVELOPED_BLUR_IN_PIXELS = 12;

const UNDEVELOPED_SCALE = 1.04;

export const developVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: UNDEVELOPED_SCALE,
    filter: `blur(${UNDEVELOPED_BLUR_IN_PIXELS}px)`,
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: DEVELOP_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO },
  },
};
