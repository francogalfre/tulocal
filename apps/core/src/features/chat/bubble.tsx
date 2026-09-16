"use client";

import { motion } from "motion/react";

import { EASE_OUT_EXPO, LAYOUT_DURATION_IN_SECONDS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

const BUBBLE_START_SCALE = 0.96;

const BUBBLE_START_OFFSET_IN_PIXELS = 10;

type BubbleProps = {
  role: "user" | "assistant";
  text: string;
};

export function Bubble({ role, text }: BubbleProps) {
  const isBuyer = role === "user";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: BUBBLE_START_OFFSET_IN_PIXELS, scale: BUBBLE_START_SCALE }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: LAYOUT_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line",
        isBuyer
          ? "origin-bottom-right self-end rounded-br-md border border-border bg-background"
          : "origin-bottom-left self-start rounded-bl-md bg-secondary text-secondary-foreground",
      )}
    >
      {text}
    </motion.div>
  );
}
