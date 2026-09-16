"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Develop } from "@/components/motion/develop";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EXPORT_FORMATS } from "@/features/product/export/formats";
import type { SceneFormat } from "@/features/product/export/formats";

const PNG_MEDIA_TYPE = "image/png";

const SHARE_PROBE_FILE_NAME = "tulocal.png";

const SHARE_CANCELLED_ERROR_NAME = "AbortError";

type PieceProps = {
  label: string;
  url: string;
  fileName: string;
  format: SceneFormat;
};

function canShareFiles(): boolean {
  if (navigator.canShare === undefined) {
    return false;
  }

  const probe = new File([], SHARE_PROBE_FILE_NAME, { type: PNG_MEDIA_TYPE });

  return navigator.canShare({ files: [probe] });
}

function isShareCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === SHARE_CANCELLED_ERROR_NAME;
}

export function Piece({ label, url, fileName, format }: PieceProps) {
  const [isShareAvailable, setIsShareAvailable] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { width, height } = EXPORT_FORMATS[format];

  useEffect(() => {
    setIsShareAvailable(canShareFiles());
  }, []);

  async function handleShare(): Promise<void> {
    setIsSharing(true);

    try {
      const response = await fetch(url);
      const file = new File([await response.blob()], fileName, { type: PNG_MEDIA_TYPE });

      await navigator.share({ files: [file], title: label });
    } catch (error) {
      if (!isShareCancelled(error)) {
        throw error;
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Develop>
        <Image
          src={url}
          alt={label}
          width={width}
          height={height}
          unoptimized
          className="h-auto w-full rounded-xl border border-border"
        />
      </Develop>
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label={`Descargar ${label}`}
          title="Descargar"
          render={<a href={url} download={fileName} />}
          nativeButton={false}
        >
          <tulocalIcons.download />
        </Button>
        {isShareAvailable ? (
          <Button
            variant="outline"
            size="icon-lg"
            aria-label={`Compartir ${label}`}
            title="Compartir"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? <Spinner /> : <tulocalIcons.share />}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
