"use client";

import { motion } from "motion/react";

import { AgentFace } from "@/features/agent/face";
import type { AgentVoice } from "@/features/agent/voice";
import { useElapsedSeconds } from "@/features/chat/elapsed";
import { EASE_OUT_EXPO, FEEDBACK_DURATION_IN_SECONDS } from "@/lib/motion/timing";

type ThinkingProps = {
  agentName: string;
  agentSeed: string;
  agentVoice: AgentVoice;
};

const FACE_SIZE_IN_PIXELS = 32;

const SECONDS_PER_MINUTE = 60;

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

export function Thinking({ agentName, agentSeed, agentVoice }: ThinkingProps) {
  const elapsedSeconds = useElapsedSeconds();

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FEEDBACK_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
      className="flex items-center gap-2 self-start py-1"
    >
      <AgentFace
        seed={agentSeed}
        voice={agentVoice}
        name={agentName}
        sizeInPixels={FACE_SIZE_IN_PIXELS}
        isThinking
      />
      <span className="text-[13px] font-medium text-muted-foreground motion-safe:animate-shimmer">
        {agentName} está pensando
      </span>
      <span className="numeric text-xs text-muted-foreground">{formatElapsed(elapsedSeconds)}</span>
    </motion.div>
  );
}
