"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { developVariants } from "@/lib/motion/develop";

type DevelopProps = {
  className?: string;
  children: ReactNode;
};

export function Develop({ className, children }: DevelopProps) {
  return (
    <motion.div variants={developVariants} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  );
}
