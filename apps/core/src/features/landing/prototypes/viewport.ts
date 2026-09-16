"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const VISIBILITY_THRESHOLD = 0.35;

export type ViewportEntry = {
  containerRef: RefObject<HTMLDivElement | null>;
  hasEnteredViewport: boolean;
};

export function useHasEnteredViewport(): ViewportEntry {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEnteredViewport(true);
            observer.disconnect();
          }
        }
      },
      { threshold: VISIBILITY_THRESHOLD },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return { containerRef, hasEnteredViewport };
}
