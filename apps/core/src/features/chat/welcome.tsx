"use client";

import { Button } from "@/components/ui/button";
import { AgentFace } from "@/features/agent/face";
import type { AgentVoice } from "@/features/agent/voice";

const WELCOME_FACE_SIZE_IN_PIXELS = 96;

const SUGGESTED_QUESTIONS = ["¿Qué incluye?", "¿Tiene marcas de uso?", "¿Hacés envíos?"];

type WelcomeProps = {
  agentName: string;
  agentSeed: string;
  agentVoice: AgentVoice;
  isReady: boolean;
  onSuggest: (text: string) => void;
};

export function Welcome({ agentName, agentSeed, agentVoice, isReady, onSuggest }: WelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
      <AgentFace
        seed={agentSeed}
        voice={agentVoice}
        name={agentName}
        sizeInPixels={WELCOME_FACE_SIZE_IN_PIXELS}
        isThinking={false}
        animate="always"
      />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-xl font-semibold">Hola, soy {agentName}</p>
        <p className="text-muted-foreground">Preguntame lo que quieras o hacé una oferta.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={!isReady}
            onClick={() => onSuggest(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
