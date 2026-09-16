"use client";

import { AnimatePresence, motion } from "motion/react";

import { Count } from "@/components/count";
import { MAX_PHOTOS } from "@/features/product/upload/limits";
import { riseVariants } from "@/lib/motion/rise";

const HINTS_BY_COUNT: Record<number, string> = {
  1: "Buena. Una más desde otro ángulo ayuda a identificarlo.",
  2: "Queda lugar para una más, si querés.",
  3: "Con eso alcanza. La publicación se arma sola.",
};

type HintProps = {
  count: number;
};

export function Hint({ count }: HintProps) {
  const hint = HINTS_BY_COUNT[count];

  return (
    <div className="grid text-sm">
      <AnimatePresence initial={false}>
        <motion.p
          key={count}
          variants={riseVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-wrap items-baseline gap-x-2 [grid-area:1/1]"
        >
          <span className="font-medium">
            <Count count={count} /> de {MAX_PHOTOS}
          </span>
          {hint !== undefined ? <span className="text-muted-foreground">{hint}</span> : null}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
