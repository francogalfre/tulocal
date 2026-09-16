"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { riseVariants } from "@/lib/motion/rise";
import { staggerVariants } from "@/lib/motion/stagger";

const INVIEW_ELEMENTS = {
  div: motion.div,
  section: motion.section,
  footer: motion.footer,
} as const;

const INVIEW_AMOUNT = 0.25;

type InViewProps = {
  as?: keyof typeof INVIEW_ELEMENTS;
  className?: string;
  stagger?: boolean;
  children: ReactNode;
};

export function InView({ as = "div", className, stagger = false, children }: InViewProps) {
  const Element = INVIEW_ELEMENTS[as];

  return (
    <Element
      variants={stagger ? staggerVariants : riseVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: INVIEW_AMOUNT }}
      className={className}
    >
      {children}
    </Element>
  );
}
