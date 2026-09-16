"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { riseVariants } from "@/lib/motion/rise";

const RISE_ELEMENTS = {
  div: motion.div,
  li: motion.li,
  ol: motion.ol,
  section: motion.section,
  article: motion.article,
} as const;

type RiseProps = {
  as?: keyof typeof RISE_ELEMENTS;
  className?: string;
  children: ReactNode;
};

export function Rise({ as = "div", className, children }: RiseProps) {
  const Element = RISE_ELEMENTS[as];

  return (
    <Element variants={riseVariants} className={className}>
      {children}
    </Element>
  );
}
