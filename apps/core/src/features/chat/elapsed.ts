"use client";

import { useEffect, useState } from "react";

const TICK_INTERVAL_IN_MILLISECONDS = 100;
const TICKS_PER_SECOND = 10;

export function useElapsedSeconds(): number {
  const [elapsedTicks, setElapsedTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTicks((ticks) => ticks + 1);
    }, TICK_INTERVAL_IN_MILLISECONDS);

    return () => clearInterval(interval);
  }, []);

  return elapsedTicks / TICKS_PER_SECOND;
}
