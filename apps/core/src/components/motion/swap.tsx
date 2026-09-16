"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { EASE_OUT_EXPO, FEEDBACK_DURATION_IN_SECONDS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

const SWAPPED_OUT_SCALE = 0.5;

type SwapProps = {
  activeKey: string;
  className?: string;
  "data-icon"?: "inline-start" | "inline-end";
  children: ReactNode;
};

export function Swap({ activeKey, className, "data-icon": iconPosition, children }: SwapProps) {
  return (
    <span
      data-icon={iconPosition}
      className={cn("inline-grid shrink-0 place-items-center", className)}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={activeKey}
          initial={{ opacity: 0, scale: SWAPPED_OUT_SCALE }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: SWAPPED_OUT_SCALE }}
          transition={{ duration: FEEDBACK_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
          className="inline-flex [grid-area:1/1]"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
