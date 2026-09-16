"use client";

import { ShareDialog } from "@/components/share";
import { Button } from "@/components/ui/button";

type ProductShareProps = {
  url: string;
  title: string | null;
};

export function ProductShare({ url, title }: ProductShareProps) {
  const dialogTitle = title === null ? "Compartí este producto" : `Compartí ${title}`;

  return (
    <ShareDialog
      url={url}
      title={dialogTitle}
      description="Mostrales el código o mandales el link directo a la publicación."
      message="Mirá lo que estoy vendiendo en tulocal"
      trigger={
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Compartir producto"
          className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100 data-popup-open:opacity-100"
        />
      }
    />
  );
}
