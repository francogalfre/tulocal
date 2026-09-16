"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Lightbox } from "@/features/product/gallery/lightbox";
import type { GalleryImage } from "@/features/product/gallery/grid";
import { riseVariants } from "@/lib/motion/rise";

type PhotosProps = {
  photoUrls: string[];
};

function buildGalleryImages(photoUrls: string[]): GalleryImage[] {
  return photoUrls.map((photoUrl) => ({ id: photoUrl, url: photoUrl, kind: "original" }));
}

export function Photos({ photoUrls }: PhotosProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const images = buildGalleryImages(photoUrls);

  return (
    <motion.div
      variants={riseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex shrink-0 gap-2 self-start overflow-x-auto pl-10"
    >
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => setOpenIndex(index)}
          aria-label={`Ver la foto ${index + 1} en grande`}
          className="group relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src={image.url}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </button>
      ))}
      <Lightbox
        images={images}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onArrange={null}
      />
    </motion.div>
  );
}
