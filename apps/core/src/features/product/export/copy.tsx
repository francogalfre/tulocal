"use client";

import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Swap } from "@/components/motion/swap";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const COPIED_FEEDBACK_IN_MILLISECONDS = 2000;

type CopyProps = {
  text: string;
};

export function Copy({ text }: CopyProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea readOnly value={text} aria-label="Texto para la publicación" />
      <Button size="xl" variant="outline" onClick={handleCopy}>
        <Swap activeKey={isCopied ? "copied" : "copy"} data-icon="inline-start">
          {isCopied ? <tulocalIcons.check /> : <tulocalIcons.copy />}
        </Swap>
        {isCopied ? "Texto copiado" : "Copiar texto"}
      </Button>
    </div>
  );
}
