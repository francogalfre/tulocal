"use client";

import { ArrowLeft, ArrowRight, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Count } from "@/components/count";
import type { CarouselApi } from "@/components/ui/carousel";
import type { GalleryImage } from "@/features/product/gallery/grid";

type LightboxProps = {
  images: GalleryImage[];
  openIndex: number | null;
  onClose: () => void;
  onArrange: ((next: GalleryImage[]) => void) | null;
};

type ArrangeActionsProps = {
  images: GalleryImage[];
  currentIndex: number;
  onArrange: (next: GalleryImage[]) => void;
};

type SlidesProps = {
  images: GalleryImage[];
  startIndex: number;
  onArrange: ((next: GalleryImage[]) => void) | null;
};

function moveImage(images: GalleryImage[], from: number, to: number): GalleryImage[] {
  const next = [...images];
  const [moved] = next.splice(from, 1);

  if (moved === undefined) {
    return images;
  }

  next.splice(to, 0, moved);

  return next;
}

function ArrangeActions({ images, currentIndex, onArrange }: ArrangeActionsProps) {
  const isCover = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Button
        variant="outline"
        size="xl"
        disabled={isCover}
        onClick={() => onArrange(moveImage(images, currentIndex, 0))}
      >
        <Star data-icon="inline-start" />
        {isCover ? "Es la portada" : "Usar de portada"}
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Mover antes"
          disabled={isCover}
          onClick={() => onArrange(moveImage(images, currentIndex, currentIndex - 1))}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Mover después"
          disabled={isLast}
          onClick={() => onArrange(moveImage(images, currentIndex, currentIndex + 1))}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function Slides({ images, startIndex, onArrange }: SlidesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentId, setCurrentId] = useState(images[startIndex]?.id ?? null);
  const currentIndex = Math.max(
    0,
    images.findIndex((image) => image.id === currentId),
  );

  useEffect(() => {
    if (api === undefined) {
      return;
    }

    function readSelection(): void {
      if (api === undefined) {
        return;
      }

      setCurrentId(images[api.selectedScrollSnap()]?.id ?? null);
    }

    api.on("select", readSelection);

    return () => {
      api.off("select", readSelection);
    };
  }, [api, images]);

  useEffect(() => {
    if (api !== undefined && api.selectedScrollSnap() !== currentIndex) {
      api.scrollTo(currentIndex, true);
    }
  }, [api, currentIndex, images]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <DialogTitle className="font-heading text-base font-medium">
          <Count count={currentIndex + 1} /> de <Count count={images.length} />
        </DialogTitle>
        <DialogClose render={<Button variant="ghost" size="icon-lg" aria-label="Cerrar" />}>
          <X />
        </DialogClose>
      </div>
      <Carousel
        opts={{ startIndex, loop: images.length > 1 }}
        setApi={setApi}
        className="min-h-0 flex-1 [&>div]:h-full"
      >
        <CarouselContent className="h-full">
          {images.map((image) => (
            <CarouselItem key={image.id} className="relative">
              <Image src={image.url} alt="" fill sizes="100vw" className="object-contain" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden sm:inline-flex" aria-label="Anterior" />
        <CarouselNext className="right-4 hidden sm:inline-flex" aria-label="Siguiente" />
      </Carousel>
      {onArrange === null ? (
        <div className="h-14 shrink-0" />
      ) : (
        <ArrangeActions images={images} currentIndex={currentIndex} onArrange={onArrange} />
      )}
    </div>
  );
}

export function Lightbox({ images, openIndex, onClose, onArrange }: LightboxProps) {
  return (
    <Dialog
      open={openIndex !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 rounded-none bg-background p-0 ring-0 sm:max-w-none"
      >
        {openIndex === null ? null : (
          <Slides images={images} startIndex={openIndex} onArrange={onArrange} />
        )}
      </DialogContent>
    </Dialog>
  );
}
