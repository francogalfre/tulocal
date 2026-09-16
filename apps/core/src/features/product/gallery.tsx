"use client";

import Image from "next/image";

import { ImageZoom } from "@/components/image-zoom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSquareImage } from "@/lib/image/square";
import { cn } from "@/lib/utils";
import type { OwnedProduct } from "@/features/product/find";

type GalleryProps = {
  images: OwnedProduct["images"];
  pendingSlots?: number;
};

type GalleryTileProps = {
  url: string;
  isFeatured: boolean;
};

function GalleryTile({ url, isFeatured }: GalleryTileProps) {
  const squareUrl = useSquareImage(url);

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-2xl bg-muted",
        isFeatured && "col-span-2 row-span-2",
      )}
    >
      {squareUrl === null ? (
        <Image
          src={url}
          alt=""
          fill
          sizes="(max-width: 672px) 66vw, 420px"
          className="object-cover"
        />
      ) : (
        <ImageZoom className="size-full" zoomMargin={96}>
          <img src={squareUrl} alt="" className="size-full object-cover" />
        </ImageZoom>
      )}
    </div>
  );
}

export function Gallery({ images, pendingSlots = 0 }: GalleryProps) {
  const generated = images.filter((image) => image.kind !== "original");
  const shown = generated.length > 0 ? generated : images;
  const placeholders = Array.from({ length: pendingSlots }, (_, index) => index);

  return (
    <div className="grid grid-cols-3 gap-2">
      {shown.map((image, index) => (
        <GalleryTile key={image.id} url={image.url} isFeatured={index === 0} />
      ))}
      {placeholders.map((slot) => (
        <Skeleton key={slot} className="aspect-square rounded-2xl" />
      ))}
    </div>
  );
}
