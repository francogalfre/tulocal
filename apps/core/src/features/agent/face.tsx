"use client";

import { Blobatar } from "@blobatar/react";
import type { Animate } from "blobatar";
import { thinking } from "blobatar/expression";

import "blobatar/motion.css";

import { VOICE_EXPRESSIONS } from "@/features/agent/voice";
import type { AgentVoice } from "@/features/agent/voice";

type AgentFaceProps = {
  seed: string;
  voice: AgentVoice;
  name: string;
  sizeInPixels: number;
  isThinking: boolean;
  animate?: Animate;
};

export function AgentFace({
  seed,
  voice,
  name,
  sizeInPixels,
  isThinking,
  animate = "hover",
}: AgentFaceProps) {
  return (
    <Blobatar
      name={seed}
      size={sizeInPixels}
      animate={animate}
      expression={isThinking ? thinking : VOICE_EXPRESSIONS[voice]}
      title={name}
      className="shrink-0"
    />
  );
}
