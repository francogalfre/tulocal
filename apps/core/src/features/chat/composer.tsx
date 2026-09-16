"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { tulocalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ComposerProps = {
  isReady: boolean;
  onSend: (text: string) => void;
};

export function Composer({ isReady, onSend }: ComposerProps) {
  const [draft, setDraft] = useState("");
  const canSend = isReady && draft.trim() !== "";

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    onSend(draft.trim());
    setDraft("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Preguntale algo o hacé una oferta"
        aria-label="Mensaje"
        className="h-11 flex-1"
        autoComplete="off"
        maxLength={1000}
      />
      <Button
        type="submit"
        size="icon-lg"
        className="size-11 rounded-lg"
        disabled={!canSend}
        aria-label="Enviar"
      >
        <tulocalIcons.send />
      </Button>
    </form>
  );
}
