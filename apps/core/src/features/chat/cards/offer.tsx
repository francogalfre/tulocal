"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Amount } from "@/components/amount";
import { Button } from "@/components/ui/button";
import { riseVariants } from "@/lib/motion/rise";

const PRICE_DROP_DELAY_IN_MILLISECONDS = 450;

const PRICE_DROP_DURATION_IN_MILLISECONDS = 1100;

const PRICE_DROP_TIMING = {
  duration: PRICE_DROP_DURATION_IN_MILLISECONDS,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

type OfferProps = {
  listPriceInArs: number;
  priceInArs: number;
  priceLabel: string;
  isFinal: boolean;
  canAccept: boolean;
  onAccept: (text: string) => void;
};

export function Offer({
  listPriceInArs,
  priceInArs,
  priceLabel,
  isFinal,
  canAccept,
  onAccept,
}: OfferProps) {
  const [shownPriceInArs, setShownPriceInArs] = useState(listPriceInArs);

  useEffect(() => {
    const timer = setTimeout(
      () => setShownPriceInArs(priceInArs),
      PRICE_DROP_DELAY_IN_MILLISECONDS,
    );

    return () => clearTimeout(timer);
  }, [priceInArs]);

  return (
    <motion.div
      variants={riseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="ml-10 flex max-w-sm shrink-0 items-center justify-between gap-3 rounded-2xl border border-border py-2.5 pr-2.5 pl-4"
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-muted-foreground">
          {isFinal ? "Mi último número" : "Te lo dejo en"}
        </span>
        <Amount
          amountInArs={shownPriceInArs}
          spinTiming={PRICE_DROP_TIMING}
          transformTiming={PRICE_DROP_TIMING}
          className="font-heading text-2xl font-semibold text-brand-deep"
        />
      </div>
      {canAccept ? (
        <Button
          size="lg"
          className="shrink-0"
          onClick={() => onAccept(`Dale, lo llevo a ${priceLabel}`)}
        >
          Lo llevo
        </Button>
      ) : null}
    </motion.div>
  );
}
