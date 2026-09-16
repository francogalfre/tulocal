"use client";

import { motion } from "motion/react";

import { tulocalIcons } from "@/components/icons";
import { riseVariants } from "@/lib/motion/rise";

export type ChatNoteKind = "asked" | "waiting" | "looked";

type NoteProps = {
  kind: ChatNoteKind;
};

const NOTE_COPY: Record<ChatNoteKind, string> = {
  asked: "Le pregunté al dueño",
  waiting: "Sigo esperando al dueño",
  looked: "Miré las fotos",
};

export function Note({ kind }: NoteProps) {
  const Icon = kind === "looked" ? tulocalIcons.camera : tulocalIcons.questionMark;

  return (
    <motion.p
      variants={riseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center gap-1.5 self-start pl-10 text-xs text-muted-foreground"
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {NOTE_COPY[kind]}
    </motion.p>
  );
}
