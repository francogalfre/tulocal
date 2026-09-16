"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { startTransition, useOptimistic, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { arrangeImages } from "@/features/product/gallery/arrange";
import { Lightbox } from "@/features/product/gallery/lightbox";
import { EASE_OUT_EXPO, LAYOUT_DURATION_IN_SECONDS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  id: string;
  url: string;
  kind: "original" | "primary" | "contextual";
};

type GalleryProps = {
  images: GalleryImage[];
  pendingSlots?: number;
  ownerProductId?: string;
};

function selectShownImages(images: GalleryImage[]): GalleryImage[] {
  const generated = images.filter((image) => image.kind !== "original");

  return generated.length > 0 ? generated : images;
}

export function Gallery({ images, pendingSlots = 0, ownerProductId }: GalleryProps) {
  const [shown, showArrangement] = useOptimistic(selectShownImages(images));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const placeholders = Array.from({ length: pendingSlots }, (_, index) => index);
  const canArrange = ownerProductId !== undefined && shown.length > 1;

  function arrange(next: GalleryImage[]): void {
    if (ownerProductId === undefined) {
      return;
    }

    startTransition(async () => {
      showArrangement(next);
      await arrangeImages({ productId: ownerProductId, imageIds: next.map((image) => image.id) });
    });
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((image, index) => (
          <motion.button
            key={image.id}
            layout
            transition={{ duration: LAYOUT_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={
              index === 0 ? "Ver la portada en grande" : `Ver la foto ${index + 1} en grande`
            }
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              index === 0 && "col-span-2 row-span-2",
            )}
          >
            <Image
              src={image.url}
              alt=""
              fill
              priority={index === 0}
              sizes="(max-width: 448px) 66vw, 300px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {canArrange && index === 0 ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-background px-3 py-1 text-xs font-medium">
                Portada
              </span>
            ) : null}
          </motion.button>
        ))}
        {placeholders.map((slot) => (
          <Skeleton key={slot} className="aspect-square rounded-xl" />
        ))}
      </div>
      <Lightbox
        images={shown}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onArrange={canArrange ? arrange : null}
      />
    </>
  );
}
