"use client";

import { useState } from "react";

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

type StoreShareProps = {
  url: string;
  title: string;
  isOwner: boolean;
};

export function StoreShare({ url, title, isOwner }: StoreShareProps) {
  const [isCopied, setIsCopied] = useState(false);
  const dialogTitle = isOwner ? "Compartí tu tienda" : `Compartí la tienda de ${title}`;
  const dialogDescription = isOwner
    ? "Mostrales el código o mandales el link directo a tu catálogo."
    : "Mostrales el código o mandale el link directo a la tienda.";
  const shareMessage = isOwner
    ? "Mirá mi local en tulocal"
    : `Mirá los productos de la tienda de ${title} en tulocal`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMessage}: ${url}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareMessage)}`;

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="icon-lg" aria-label="Compartir tienda" />}
      >
        <tulocalIcons.share />
      </DialogTrigger>
      <DialogContent className="gap-6 p-8 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-12">
          <QRCode value={url} size={200} className="justify-self-center" />
          <div className="flex w-full flex-col gap-4">
            <Button size="lg" className="h-11" onClick={handleCopy}>
              <Swap activeKey={isCopied ? "copied" : "copy"} data-icon="inline-start">
                {isCopied ? <tulocalIcons.check /> : <tulocalIcons.copy />}
              </Swap>
              {isCopied ? "Link copiado" : "Copiar link"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11"
              render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              <tulocalIcons.message data-icon="inline-start" />
              Compartir por WhatsApp
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11"
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
