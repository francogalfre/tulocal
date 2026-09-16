"use client";

import { motion } from "motion/react";

import { tulocalIcons } from "@/components/icons";
import { Swap } from "@/components/motion/swap";
import { MAX_PHOTOS } from "@/features/product/upload/limits";
import { EASE_OUT_EXPO, STATE_DURATION_IN_SECONDS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

type SlotProps = {
  isCover: boolean;
  isNext: boolean;
  isDragging: boolean;
  onPick: () => void;
};

export function Slot({ isCover, isNext, isDragging, onPick }: SlotProps) {
  const isHighlighted = isDragging && isNext;
  const label = isCover ? "Sacá o subí fotos" : "Agregar otra foto";

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: STATE_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
      type="button"
      onClick={onPick}
      aria-label={label}
      className={cn(
        "group/slot absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-center outline-none transition-[background-color,border-color,color,transform] duration-200 ease-out hover:border-brand-deep/60 hover:bg-muted/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]",
        isNext ? "border-brand-deep/40 text-brand-deep" : "border-border text-muted-foreground/60",
        isHighlighted && "scale-[1.01] border-brand-deep bg-muted",
        isCover && "rounded-2xl",
      )}
    >
      <Swap
        activeKey={isHighlighted ? "drop" : isCover ? "camera" : "plus"}
        className="transition-transform duration-200 ease-out group-hover/slot:scale-110"
      >
        {isHighlighted ? (
          <tulocalIcons.imageAdd className={isCover ? "size-8" : "size-5"} aria-hidden="true" />
        ) : isCover ? (
          <tulocalIcons.camera className="size-8" aria-hidden="true" />
        ) : (
          <tulocalIcons.plus className="size-5" aria-hidden="true" />
        )}
      </Swap>
      {isCover ? (
        <span className="flex flex-col gap-1">
          <span className="font-medium text-foreground">
            {isHighlighted ? "Soltá las fotos acá" : label}
          </span>
          <span className="text-sm text-muted-foreground">
            Hasta {MAX_PHOTOS}, con luz natural y el producto entero en cuadro.
          </span>
        </span>
      ) : null}
    </motion.button>
  );
}
