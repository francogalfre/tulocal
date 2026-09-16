import type { Variants } from "motion/react";

import { STAGGER_STEP_IN_SECONDS } from "@/lib/motion/timing";

export const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_STEP_IN_SECONDS } },
  exit: {},
};
