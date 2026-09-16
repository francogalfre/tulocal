import { and, count, eq, gte, ne, sql } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { questions } from "@tulocal/database/schema/questions";
import { visits } from "@tulocal/database/schema/visits";

import { findProductPerformance, rankProductPerformance } from "@/features/metrics/products";
import type { ProductPerformance } from "@/features/metrics/products";

const TRENDED_DAYS = 30;

const MILLISECONDS_IN_A_DAY = 86_400_000;

const visitDay = sql<string>`to_char(${visits.createdAt}, 'YYYY-MM-DD')`;

export type DailyVisits = {
  day: string;
  total: number;
};

export type StoreMetrics = {
  recentVisits: number;
  storeVisits: number;
  productVisits: number;
  chats: number;
  seriousBuyers: number;
  whatsappClicks: number;
  pendingQuestions: number;
  publishedProducts: number;
  soldProducts: number;
  dailyVisits: DailyVisits[];
  topProducts: ProductPerformance[];
};

async function countStoreVisits(storeId: string): Promise<number> {
  const rows = await database
    .select({ total: count() })
    .from(visits)
    .where(and(eq(visits.storeId, storeId), eq(visits.kind, "store")));

  return rows[0]?.total ?? 0;
}

async function countPendingQuestions(storeId: string): Promise<number> {
  const rows = await database
    .select({ total: count() })
    .from(questions)
    .innerJoin(products, eq(products.id, questions.productId))
    .where(and(eq(products.storeId, storeId), eq(questions.status, "pending")));

  return rows[0]?.total ?? 0;
}

async function queryDailyVisits(storeId: string, since: Date): Promise<DailyVisits[]> {
  return database
    .select({ day: visitDay, total: count() })
    .from(visits)
    .where(
      and(eq(visits.storeId, storeId), gte(visits.createdAt, since), ne(visits.kind, "whatsapp")),
    )
    .groupBy(visitDay);
}

function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fillMissingDays(recorded: DailyVisits[]): DailyVisits[] {
  const totalsByDay = new Map(recorded.map((entry) => [entry.day, entry.total]));
  const today = Date.now();

  return Array.from({ length: TRENDED_DAYS }, (_, index) => {
    const day = formatDay(new Date(today - (TRENDED_DAYS - 1 - index) * MILLISECONDS_IN_A_DAY));

    return { day, total: totalsByDay.get(day) ?? 0 };
  });
}

export async function summarizeStoreMetrics(storeId: string): Promise<StoreMetrics> {
  const since = new Date(Date.now() - (TRENDED_DAYS - 1) * MILLISECONDS_IN_A_DAY);
  const [performance, storeVisits, pendingQuestions, recordedDays] = await Promise.all([
    findProductPerformance(storeId),
    countStoreVisits(storeId),
    countPendingQuestions(storeId),
    queryDailyVisits(storeId, since),
  ]);

  const dailyVisits = fillMissingDays(recordedDays);

  return {
    dailyVisits,
    pendingQuestions,
    storeVisits,
    recentVisits: dailyVisits.reduce((total, entry) => total + entry.total, 0),
    productVisits: performance.reduce((total, product) => total + product.views, 0),
    chats: performance.reduce((total, product) => total + product.chats, 0),
    seriousBuyers: performance.reduce((total, product) => total + product.seriousBuyers, 0),
    whatsappClicks: performance.reduce((total, product) => total + product.whatsappClicks, 0),
    publishedProducts: performance.filter((product) => product.status === "published").length,
    soldProducts: performance.filter((product) => product.status === "sold").length,
    topProducts: rankProductPerformance(performance),
  };
}
