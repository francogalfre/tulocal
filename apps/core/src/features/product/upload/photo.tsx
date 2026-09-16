"use client";

import { motion } from "motion/react";

import { tulocalIcons } from "@/components/icons";
import { developVariants } from "@/lib/motion/develop";
import {
  EASE_OUT_EXPO,
  LAYOUT_DURATION_IN_SECONDS,
  STATE_DURATION_IN_SECONDS,
} from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import type { SelectedPhoto } from "@/features/product/upload/selection";

const REMOVED_SCALE = 0.85;

type PhotoProps = {
  photo: SelectedPhoto;
  position: number;
  isCover: boolean;
  isUploading: boolean;
  isNew: boolean;
  onRemove: (id: string) => void;
  onPromote: (id: string) => void;
};

export function Photo({
  photo,
  position,
  isCover,
  isUploading,
  isNew,
  onRemove,
  onPromote,
}: PhotoProps) {
  return (
    <motion.div
      layoutId={photo.id}
      variants={developVariants}
      initial={isNew ? "hidden" : false}
      animate="visible"
      exit={{
        opacity: 0,
        scale: REMOVED_SCALE,
        transition: { duration: STATE_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO },
      }}
      transition={{ layout: { duration: LAYOUT_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO } }}
      className={cn(
        "group/photo absolute inset-0 overflow-hidden bg-muted",
        isCover ? "rounded-2xl" : "rounded-xl",
      )}
    >
      {isCover ? (
        <img src={photo.previewUrl} alt={`Foto ${position}`} className="size-full object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => onPromote(photo.id)}
          disabled={isUploading}
          aria-label={`Usar la foto ${position} como portada`}
          className="block size-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset disabled:pointer-events-none"
        >
          <img
            src={photo.previewUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 ease-out group-hover/photo:scale-[1.04]"
          />
        </button>
      )}
      {isCover ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-background px-3 py-1 text-xs font-medium">
          Portada
        </span>
      ) : (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-background px-2.5 py-1 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100 group-focus-within/photo:opacity-100">
          Hacer portada
        </span>
      )}
      {isUploading ? (
        <span className="absolute inset-x-0 h-0.5 bg-brand motion-safe:animate-scan" />
      ) : (
        <button
          type="button"
          onClick={() => onRemove(photo.id)}
          aria-label={`Quitar la foto ${position}`}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground outline-none transition-[background-color,transform] duration-200 ease-out hover:bg-background hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
        >
          <tulocalIcons.close className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
