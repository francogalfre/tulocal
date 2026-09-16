import { useEffect, useState } from "react";

const TICK_INTERVAL_IN_MILLISECONDS = 1000;

const MILLISECONDS_PER_SECOND = 1000;

function computeElapsedSeconds(since: Date): number {
  return Math.max(0, Math.floor((Date.now() - since.getTime()) / MILLISECONDS_PER_SECOND));
}

export function useElapsedSeconds(since: Date): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    setElapsedSeconds(computeElapsedSeconds(since));

    const interval = setInterval(
      () => setElapsedSeconds(computeElapsedSeconds(since)),
      TICK_INTERVAL_IN_MILLISECONDS,
    );

    return () => clearInterval(interval);
  }, [since]);

  return elapsedSeconds;
}
