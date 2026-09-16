import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OwnedProduct } from "@/features/product/find";

type GalleryProps = {
  images: OwnedProduct["images"];
  pendingSlots?: number;
};

export function Gallery({ images, pendingSlots = 0 }: GalleryProps) {
  const generated = images.filter((image) => image.kind !== "original");
  const shown = generated.length > 0 ? generated : images;
  const placeholders = Array.from({ length: pendingSlots }, (_, index) => index);

  return (
    <div className="grid grid-cols-3 gap-2">
      {shown.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            "relative aspect-square overflow-hidden rounded-xl bg-muted",
            index === 0 && "col-span-2 row-span-2",
          )}
        >
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(max-width: 448px) 66vw, 300px"
            className="object-cover"
          />
        </div>
      ))}
      {placeholders.map((slot) => (
        <Skeleton key={slot} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
}
