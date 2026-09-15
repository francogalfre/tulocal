"use client";

import { Button } from "@tulocal/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tulocal/ui/components/card";
import { Copy, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ShareCard({
  title,
  description,
  url,
}: {
  title: string;
  description?: string;
  url: string;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { width: 320, margin: 1 })
      .then((data) => active && setQr(data))
      .catch(() => active && setQr(null));
    return () => {
      active = false;
    };
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {qr ? (
          <img src={qr} alt={`QR de ${title}`} className="size-40 shrink-0 bg-white" />
        ) : (
          <div className="size-40 shrink-0 animate-pulse bg-muted" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <code className="truncate border bg-muted px-2 py-1.5 text-xs">{url}</code>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={copy}>
              <Copy data-icon="inline-start" />
              Copiar link
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<a href={url} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink data-icon="inline-start" />
              Abrir
            </Button>
            {qr && (
              <Button
                size="sm"
                variant="outline"
                render={
                  <a href={qr} download={`qr-${title.toLowerCase().replaceAll(/\s+/g, "-")}.png`} />
                }
              >
                Descargar QR
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
