"use client";

import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AgentFace } from "@/features/agent/face";
import { VOICE_DESCRIPTIONS, VOICE_LABELS } from "@/features/agent/voice";
import type { AgentVoice } from "@/features/agent/voice";

const AGENT_NAME_MAX_LENGTH = 30;

const PREVIEW_FACE_SIZE_IN_PIXELS = 72;

const VOICES: AgentVoice[] = ["cordial", "playful", "direct"];

type AgentFieldsProps = {
  agentName: string;
  agentSeed: string;
  agentVoice: AgentVoice;
  agentOpensNegotiation: boolean;
};

export function AgentFields({
  agentName,
  agentSeed,
  agentVoice,
  agentOpensNegotiation,
}: AgentFieldsProps) {
  const [seed, setSeed] = useState(agentSeed);
  const [name, setName] = useState(agentName);
  const [voice, setVoice] = useState(agentVoice);

  function selectVoice(selected: string): void {
    const match = VOICES.find((option) => option === selected);

    if (match !== undefined) {
      setVoice(match);
    }
  }

  return (
    <FieldSet>
      <FieldLegend>Tu vendedor</FieldLegend>
      <FieldDescription>
        Atiende el chat de cada producto, negocia y te avisa cuando hay un comprador en serio.
      </FieldDescription>
      <input type="hidden" name="agentSeed" value={seed} />
      <FieldGroup className="gap-6">
        <div className="flex items-center gap-4">
          <AgentFace
            seed={seed}
            voice={voice}
            name={name}
            sizeInPixels={PREVIEW_FACE_SIZE_IN_PIXELS}
            isThinking={false}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSeed(crypto.randomUUID())}
          >
            <tulocalIcons.shuffle data-icon="inline-start" />
            Cambiar cara
          </Button>
        </div>
        <Field>
          <FieldLabel htmlFor="agentName">Nombre</FieldLabel>
          <Input
            id="agentName"
            name="agentName"
            className="h-11"
            maxLength={AGENT_NAME_MAX_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Cómo habla</FieldLabel>
          <RadioGroup name="agentVoice" value={voice} onValueChange={selectVoice}>
            {VOICES.map((option) => (
              <FieldLabel key={option} htmlFor={`agentVoice-${option}`}>
                <Field orientation="horizontal">
                  <RadioGroupItem id={`agentVoice-${option}`} value={option} />
                  <FieldContent>
                    <FieldTitle>{VOICE_LABELS[option]}</FieldTitle>
                    <FieldDescription>{VOICE_DESCRIPTIONS[option]}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </Field>
        <FieldLabel htmlFor="agentOpensNegotiation">
          <Field orientation="horizontal">
            <Checkbox
              id="agentOpensNegotiation"
              name="agentOpensNegotiation"
              defaultChecked={agentOpensNegotiation}
            />
            <FieldContent>
              <FieldTitle>Propone regatear</FieldTitle>
              <FieldDescription>
                Invita al comprador a tirar un número en vez de esperar la oferta. Nunca baja del
                precio mínimo que pusiste.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </FieldGroup>
    </FieldSet>
  );
}
