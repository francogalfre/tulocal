"use client";

import { CircleQuestionMark } from "lucide-react";
import { motion } from "motion/react";

import { riseVariants } from "@/lib/motion/rise";

type AskedProps = {
  status: "logged" | "pending";
};

const STATUS_COPY = {
  logged: "Le pregunté al dueño",
  pending: "Sigo esperando al dueño",
};

export function Asked({ status }: AskedProps) {
  return (
    <motion.p
      variants={riseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center gap-1.5 self-start px-1 text-xs text-muted-foreground"
    >
      <CircleQuestionMark className="size-3.5" aria-hidden="true" />
      {STATUS_COPY[status]}
    </motion.p>
  );
}
