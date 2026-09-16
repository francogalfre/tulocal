"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

import { XLogo } from "@/components/brand/x";
import { Button } from "@/components/ui/button";

const COPIED_FEEDBACK_IN_MILLISECONDS = 2000;

type ShareProps = {
  url: string;
};

export function Share({ url }: ShareProps) {
  const [isCopied, setIsCopied] = useState(false);
  const shareMessage = "Mirá lo que estoy vendiendo en tulocal";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMessage}: ${url}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareMessage)}`;

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  return (
    <div className="flex flex-col gap-3">
      <Button size="xl" onClick={handleCopy}>
        {isCopied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {isCopied ? "Link copiado" : "Copiar link"}
      </Button>
      <Button
        size="xl"
        variant="outline"
        render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}
        nativeButton={false}
      >
        <MessageCircle data-icon="inline-start" />
        Compartir por WhatsApp
      </Button>
      <Button
        size="xl"
        variant="outline"
        render={<a href={twitterUrl} target="_blank" rel="noreferrer" />}
        nativeButton={false}
      >
        <XLogo data-icon="inline-start" />
        Compartir en X
      </Button>
    </div>
  );
}
