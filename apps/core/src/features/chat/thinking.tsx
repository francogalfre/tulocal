"use client";

import { motion } from "motion/react";

import { useElapsedSeconds } from "@/features/chat/elapsed";
import { EASE_OUT_EXPO, FEEDBACK_DURATION_IN_SECONDS } from "@/lib/motion/timing";

type ThinkingProps = {
  agentName: string;
};

const PIXEL_COUNT = 9;
const SECONDS_PER_MINUTE = 60;
const pixelKeys = Array.from({ length: PIXEL_COUNT }, (_, index) => `pixel-${index}`);

function formatSeconds(seconds: number): string {
  return `${seconds.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
}

function formatElapsed(totalSeconds: number): string {
  if (totalSeconds < SECONDS_PER_MINUTE) {
    return formatSeconds(totalSeconds);
  }

  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${minutes} min ${formatSeconds(seconds)}`;
}

export function Thinking({ agentName }: ThinkingProps) {
  const elapsedSeconds = useElapsedSeconds();

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FEEDBACK_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
      className="flex items-center gap-2.5 self-start px-1 py-2"
    >
      <span
        aria-hidden="true"
        className="grid w-fit shrink-0 grid-cols-3 gap-px motion-safe:animate-pixels"
      >
        {pixelKeys.map((key) => (
          <span key={key} className="size-1 rounded-xs bg-foreground opacity-15" />
        ))}
      </span>
      <span className="text-[13px] font-medium text-muted-foreground motion-safe:animate-shimmer">
        {agentName} está pensando
      </span>
      <span className="numeric text-xs text-muted-foreground">{formatElapsed(elapsedSeconds)}</span>
    </motion.div>
  );
}
