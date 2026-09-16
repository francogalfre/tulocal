"use client";

import Image from "next/image";

import { Develop } from "@/components/motion/develop";
import { Skeleton } from "@/components/ui/skeleton";
import type { OwnedProduct } from "@/features/product/find";

const SHOT_LABELS = ["Fondo blanco", "En contexto", "Editorial"] as const;

type PreviewProps = {
  images: OwnedProduct["images"];
};

export function Preview({ images }: PreviewProps) {
  const generated = images.filter((image) => image.kind !== "original");
  const pendingLabels = SHOT_LABELS.slice(generated.length);

  return (
    <div className="grid grid-cols-3 gap-2">
      {generated.map((image) => (
        <Develop
          key={image.id}
          className="relative aspect-square overflow-hidden rounded-xl bg-muted"
        >
          <Image src={image.url} alt="" fill sizes="150px" className="object-cover" />
        </Develop>
      ))}
      {pendingLabels.map((label) => (
        <Skeleton
          key={label}
          className="flex aspect-square items-end justify-start rounded-xl p-3 text-xs font-medium text-muted-foreground"
        >
          {label}
        </Skeleton>
      ))}
    </div>
  );
}
