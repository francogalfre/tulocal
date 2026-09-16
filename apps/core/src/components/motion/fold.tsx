"use client";

import { cn } from "cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { EASE_OUT_EXPO, LAYOUT_DURATION_IN_SECONDS } from "@/lib/motion/timing";

type FoldProps = {
  isOpen: boolean;
  className?: string;
  children: ReactNode;
};

export function Fold({ isOpen, className, children }: FoldProps) {
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0 : LAYOUT_DURATION_IN_SECONDS;

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="fold"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration, ease: EASE_OUT_EXPO }}
          className={cn("overflow-hidden", className)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
