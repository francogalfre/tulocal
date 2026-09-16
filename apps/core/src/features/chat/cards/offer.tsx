"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { riseVariants } from "@/lib/motion/rise";

type OfferProps = {
  priceLabel: string;
  isFinal: boolean;
  canAccept: boolean;
  onAccept: (text: string) => void;
};

export function Offer({ priceLabel, isFinal, canAccept, onAccept }: OfferProps) {
  return (
    <motion.div
      variants={riseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="ml-10 flex w-full max-w-sm shrink-0 items-center justify-between gap-3 self-start rounded-2xl border border-border py-2.5 pr-2.5 pl-4"
    >
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground">
          {isFinal ? "Mi último número" : "Te lo dejo en"}
        </span>
        <span className="numeric font-heading text-2xl font-semibold text-brand-deep">
          {priceLabel}
        </span>
      </div>
      {canAccept ? (
        <Button size="lg" onClick={() => onAccept(`Dale, lo llevo a ${priceLabel}`)}>
          Lo llevo
        </Button>
      ) : null}
    </motion.div>
  );
}
