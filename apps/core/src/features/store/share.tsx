"use client";

import { ShareDialog } from "@/components/share";
import { Button } from "@/components/ui/button";

type StoreShareProps = {
  url: string;
  title: string;
  isOwner: boolean;
};

export function StoreShare({ url, title, isOwner }: StoreShareProps) {
  const dialogTitle = isOwner ? "Compartí tu tienda" : `Compartí la tienda de ${title}`;
  const dialogDescription = isOwner
    ? "Mostrales el código o mandales el link directo a tu catálogo."
    : "Mostrales el código o mandale el link directo a la tienda.";
  const shareMessage = isOwner
    ? "Mirá mi local en tulocal"
    : `Mirá los productos de la tienda de ${title} en tulocal`;

  return (
    <ShareDialog
      url={url}
      title={dialogTitle}
      description={dialogDescription}
      message={shareMessage}
      trigger={<Button variant="outline" size="icon-lg" aria-label="Compartir tienda" />}
    />
  );
}
