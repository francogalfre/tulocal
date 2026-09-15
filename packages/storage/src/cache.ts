import type { ZodType } from "zod";

import { redis } from "@tulocal/storage/redis";

const EXPIRE_IN_SECONDS_FLAG = "EX";

export type CacheEntry<Value> = {
  key: string;
  schema: ZodType<Value>;
  timeToLiveInSeconds: number;
};

export type ComputeCacheValue<Value> = () => Promise<Value>;

export async function readCache<Value>(entry: CacheEntry<Value>): Promise<Value | null> {
  const serialized = await redis.get(entry.key);
  if (serialized === null) {
    return null;
  }

  const parsed = entry.schema.safeParse(JSON.parse(serialized));
  if (!parsed.success) {
    await redis.del(entry.key);
    return null;
  }

  return parsed.data;
}

export async function writeCache<Value>(entry: CacheEntry<Value>, value: Value): Promise<void> {
  await redis.set(
    entry.key,
    JSON.stringify(value),
    EXPIRE_IN_SECONDS_FLAG,
    entry.timeToLiveInSeconds,
  );
}

export async function removeCache<Value>(entry: CacheEntry<Value>): Promise<void> {
  await redis.del(entry.key);
}

export async function rememberCache<Value>(
  entry: CacheEntry<Value>,
  compute: ComputeCacheValue<Value>,
): Promise<Value> {
  const cached = await readCache(entry);
  if (cached !== null) {
    return cached;
  }

  const computed = await compute();
  await writeCache(entry, computed);

  return computed;
}
