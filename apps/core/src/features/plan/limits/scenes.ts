import { z } from "zod";

import { redis } from "@tulocal/storage/redis";

import { findCurrentPlan } from "@/features/plan/access/current";
import { findArgentineMonthStart } from "@/features/plan/limits/period";

const SCENE_COUNTER_TIME_TO_LIVE_IN_SECONDS = 40 * 24 * 60 * 60;

const storedCountSchema = z.coerce.number().int().nonnegative().catch(0);

export type SceneUsage = {
  generatedThisMonth: number;
  monthlySceneLimit: number;
};

function buildSceneCounterKey(storeId: string): string {
  return `scene-usage:${storeId}:${findArgentineMonthStart(new Date()).toISOString()}`;
}

export async function findSceneUsage(storeId: string): Promise<SceneUsage> {
  const { details } = await findCurrentPlan(storeId);
  const storedCount = await redis.get(buildSceneCounterKey(storeId));

  return {
    generatedThisMonth: storedCountSchema.parse(storedCount ?? 0),
    monthlySceneLimit: details.monthlySceneLimit,
  };
}

export async function reserveSceneGeneration(storeId: string): Promise<boolean> {
  const { details } = await findCurrentPlan(storeId);
  const key = buildSceneCounterKey(storeId);
  const generatedThisMonth = await redis.incr(key);

  if (generatedThisMonth === 1) {
    await redis.expire(key, SCENE_COUNTER_TIME_TO_LIVE_IN_SECONDS);
  }

  if (generatedThisMonth > details.monthlySceneLimit) {
    await redis.decr(key);
    return false;
  }

  return true;
}
