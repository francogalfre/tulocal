"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { tulocalIcons } from "@/components/icons";
import { Swap } from "@/components/motion/swap";
import { QRCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COPIED_FEEDBACK_IN_MILLISECONDS = 2000;

const QR_SIZE_IN_PIXELS = 168;

type ShareDialogProps = {
  url: string;
  title: string;
  description: string;
  message: string;
  trigger: ReactElement;
};

export function ShareDialog({ url, title, description, message, trigger }: ShareDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message}: ${url}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  return (
    <Dialog>
      <DialogTrigger render={trigger}>
        <tulocalIcons.share />
      </DialogTrigger>
      <DialogContent className="gap-5 p-6 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6">
          <QRCode value={url} size={QR_SIZE_IN_PIXELS} className="justify-self-center" />
          <div className="flex w-full flex-col gap-2">
            <Button size="lg" onClick={handleCopy}>
              <Swap activeKey={isCopied ? "copied" : "copy"} data-icon="inline-start">
                {isCopied ? <tulocalIcons.check /> : <tulocalIcons.copy />}
              </Swap>
              {isCopied ? "Link copiado" : "Copiar link"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              <tulocalIcons.message data-icon="inline-start" />
              Compartir por WhatsApp
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href={twitterUrl} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              <tulocalIcons.xLogo data-icon="inline-start" />
              Compartir en X
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
