import { and, count, eq, gte } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { conversations } from "@tulocal/database/schema/conversations";
import { productCreations } from "@tulocal/database/schema/creations";
import { messages } from "@tulocal/database/schema/messages";
import { products } from "@tulocal/database/schema/products";

import { findCurrentPlan } from "@/features/plan/access/current";
import { findArgentineDayStart, findArgentineMonthStart } from "@/features/plan/limits/period";
import type { PlanDetails } from "@/features/plan/catalog";

export type ProductCreationBlocker = "plan-limit" | "daily-limit";

export type ProductUsage = {
  usedProducts: number;
  productLimit: number;
  isProductLimitLifetime: boolean;
};

async function countProductsTowardsLimit(storeId: string, details: PlanDetails): Promise<number> {
  if (details.isProductLimitLifetime) {
    return database.$count(productCreations, eq(productCreations.storeId, storeId));
  }

  return database.$count(products, eq(products.storeId, storeId));
}

async function countProductCreationsToday(storeId: string): Promise<number> {
  return database.$count(
    productCreations,
    and(
      eq(productCreations.storeId, storeId),
      gte(productCreations.createdAt, findArgentineDayStart(new Date())),
    ),
  );
}

async function countAgentMessagesThisMonth(storeId: string): Promise<number> {
  const [row] = await database
    .select({ total: count() })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      and(
        eq(conversations.storeId, storeId),
        eq(messages.role, "agent"),
        gte(messages.createdAt, findArgentineMonthStart(new Date())),
      ),
    );

  return row === undefined ? 0 : row.total;
}

export async function findProductUsage(storeId: string): Promise<ProductUsage> {
  const { details } = await findCurrentPlan(storeId);

  return {
    usedProducts: await countProductsTowardsLimit(storeId, details),
    productLimit: details.productLimit,
    isProductLimitLifetime: details.isProductLimitLifetime,
  };
}

export async function findProductCreationBlocker(
  storeId: string,
): Promise<ProductCreationBlocker | null> {
  const { details } = await findCurrentPlan(storeId);
  const usedProducts = await countProductsTowardsLimit(storeId, details);

  if (usedProducts >= details.productLimit) {
    return "plan-limit";
  }

  if (details.dailyCreationLimit === null) {
    return null;
  }

  const creationsToday = await countProductCreationsToday(storeId);

  return creationsToday >= details.dailyCreationLimit ? "daily-limit" : null;
}

export async function isAgentMessageLimitReached(storeId: string): Promise<boolean> {
  const { details } = await findCurrentPlan(storeId);

  if (details.monthlyAgentMessageLimit === null) {
    return false;
  }

  return (await countAgentMessagesThisMonth(storeId)) >= details.monthlyAgentMessageLimit;
}
