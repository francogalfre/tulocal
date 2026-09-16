"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { riseVariants } from "@/lib/motion/rise";

type RevealProps = {
  className?: string;
  children: ReactNode;
};

export function Reveal({ className, children }: RevealProps) {
  return (
    <motion.div variants={riseVariants} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  );
}
