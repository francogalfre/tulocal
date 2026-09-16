"use client";

import { useEffect, useState } from "react";

export function useRevealedCount(total: number): number {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(total));

    return () => cancelAnimationFrame(frame);
  }, [total]);

  return revealed;
}
