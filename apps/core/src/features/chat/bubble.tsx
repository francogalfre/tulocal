"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { EASE_OUT_EXPO, LAYOUT_DURATION_IN_SECONDS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

const BUBBLE_START_SCALE = 0.96;

const BUBBLE_START_OFFSET_IN_PIXELS = 10;

type BubbleProps = {
  role: "user" | "assistant";
  text: string;
  avatar?: ReactNode;
};

export function Bubble({ role, text, avatar }: BubbleProps) {
  const isBuyer = role === "user";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: BUBBLE_START_OFFSET_IN_PIXELS, scale: BUBBLE_START_SCALE }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: LAYOUT_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
      className={cn(
        "flex max-w-[85%] items-end gap-2",
        isBuyer ? "origin-bottom-right self-end" : "origin-bottom-left self-start",
      )}
    >
      {avatar}
      <div
        className={cn(
          "min-w-0 rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line",
          isBuyer
            ? "rounded-br-md border border-border bg-background"
            : "rounded-bl-md bg-secondary text-secondary-foreground",
        )}
      >
        {text}
      </div>
    </motion.div>
  );
}
