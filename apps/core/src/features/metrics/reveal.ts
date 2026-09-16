"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const REVEAL_AMOUNT = 0.5;

export function useRevealedCount(total: number): number {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(total));

    return () => cancelAnimationFrame(frame);
  }, [total]);

  return revealed;
}

export function useRevealedCountOnView(total: number) {
  const containerReference = useRef<HTMLDivElement>(null);
  const inView = useInView(containerReference, { once: true, amount: REVEAL_AMOUNT });
  const revealed = useRevealedCount(inView ? total : 0);

  return { containerReference, revealed };
}
