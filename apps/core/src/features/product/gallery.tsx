import Image from "next/image";

import type { OwnedProduct } from "@/features/product/find";

type GalleryProps = {
  images: OwnedProduct["images"];
};

export function Gallery({ images }: GalleryProps) {
  const generated = images.filter((image) => image.kind !== "original");
  const shown = generated.length > 0 ? generated : images;

  return (
    <div className="grid grid-cols-3 gap-2">
      {shown.map((image, index) => (
        <div
          key={image.id}
          className={`relative aspect-square overflow-hidden rounded-lg bg-muted ${index === 0 ? "col-span-2 row-span-2" : ""}`}
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
    </div>
  );
}
