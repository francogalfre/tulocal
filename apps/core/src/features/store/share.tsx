"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const COPIED_FEEDBACK_IN_MILLISECONDS = 2000;

type StoreShareProps = {
  url: string;
  title: string;
};

export function StoreShare({ url, title }: StoreShareProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleShare(): Promise<void> {
    if (navigator.share !== undefined) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  return (
    <Button variant="outline" size="icon-lg" aria-label="Compartir tienda" onClick={handleShare}>
      {isCopied ? <Check /> : <Share2 />}
    </Button>
  );
}
