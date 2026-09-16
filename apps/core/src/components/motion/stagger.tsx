"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { staggerVariants } from "@/lib/motion/stagger";

const STAGGER_ELEMENTS = { div: motion.div, ol: motion.ol, ul: motion.ul } as const;

type StaggerProps = {
  as?: keyof typeof STAGGER_ELEMENTS;
  className?: string;
  children: ReactNode;
};

export function Stagger({ as = "div", className, children }: StaggerProps) {
  const Element = STAGGER_ELEMENTS[as];

  return (
    <Element variants={staggerVariants} initial="hidden" animate="visible" className={className}>
      {children}
    </Element>
  );
}
