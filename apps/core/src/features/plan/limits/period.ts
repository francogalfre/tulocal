const ARGENTINE_OFFSET_IN_MILLISECONDS = 3 * 60 * 60 * 1000;

function shiftToArgentineWallClock(now: Date): Date {
  return new Date(now.getTime() - ARGENTINE_OFFSET_IN_MILLISECONDS);
}

function shiftFromArgentineWallClock(wallClockInMilliseconds: number): Date {
  return new Date(wallClockInMilliseconds + ARGENTINE_OFFSET_IN_MILLISECONDS);
}

export function findArgentineDayStart(now: Date): Date {
  const wallClock = shiftToArgentineWallClock(now);

  return shiftFromArgentineWallClock(
    Date.UTC(wallClock.getUTCFullYear(), wallClock.getUTCMonth(), wallClock.getUTCDate()),
  );
}

export function findArgentineMonthStart(now: Date): Date {
  const wallClock = shiftToArgentineWallClock(now);

  return shiftFromArgentineWallClock(
    Date.UTC(wallClock.getUTCFullYear(), wallClock.getUTCMonth(), 1),
  );
}
