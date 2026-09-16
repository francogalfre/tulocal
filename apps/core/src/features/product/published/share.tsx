"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

const COPIED_FEEDBACK_IN_MILLISECONDS = 2000;

type ShareProps = {
  url: string;
};

export function Share({ url }: ShareProps) {
  const [isCopied, setIsCopied] = useState(false);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" onClick={handleCopy}>
        {isCopied ? "copiado" : "copiar link"}
      </Button>
      <Button
        size="lg"
        variant="outline"
        render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}
        nativeButton={false}
      >
        compartir por WhatsApp
      </Button>
    </div>
  );
}
