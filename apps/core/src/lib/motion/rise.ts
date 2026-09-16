import type { Variants } from "motion/react";

import {
  EASE_OUT_EXPO,
  ENTRANCE_DURATION_IN_SECONDS,
  STAGGER_STEP_IN_SECONDS,
  STATE_DURATION_IN_SECONDS,
} from "@/lib/motion/timing";

const RISE_DISTANCE_IN_PIXELS = 12;

export const riseVariants: Variants = {
  hidden: { opacity: 0, y: RISE_DISTANCE_IN_PIXELS },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ENTRANCE_DURATION_IN_SECONDS,
      ease: EASE_OUT_EXPO,
      staggerChildren: STAGGER_STEP_IN_SECONDS,
    },
  },
  exit: {
    opacity: 0,
    y: -RISE_DISTANCE_IN_PIXELS / 2,
    transition: { duration: STATE_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO },
  },
};
