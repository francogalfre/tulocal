import { desc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";
import { questions } from "@tulocal/database/schema/questions";

const MAX_RANKED_PRODUCTS = 5;

const MAX_RECENT_QUESTIONS_PER_PRODUCT = 3;

export type AskedQuestion = {
  id: string;
  question: string;
  isPending: boolean;
};

export type ProductQuestions = {
  productId: string;
  title: string;
  totalQuestions: number;
  pendingQuestions: number;
  recentQuestions: AskedQuestion[];
};

type QuestionRow = {
  id: string;
  productId: string;
  title: string | null;
  question: string;
  status: "pending" | "answered";
};

function groupByProduct(rows: QuestionRow[]): ProductQuestions[] {
  const groups = new Map<string, ProductQuestions>();

  for (const row of rows) {
    const group = groups.get(row.productId) ?? {
      productId: row.productId,
      title: row.title ?? "Publicación sin título",
      totalQuestions: 0,
      pendingQuestions: 0,
      recentQuestions: [],
    };
    const isPending = row.status === "pending";

    group.totalQuestions += 1;
    group.pendingQuestions += isPending ? 1 : 0;

    if (group.recentQuestions.length < MAX_RECENT_QUESTIONS_PER_PRODUCT) {
      group.recentQuestions.push({ id: row.id, question: row.question, isPending });
    }

    groups.set(row.productId, group);
  }

  return [...groups.values()];
}

export async function findMostAskedProducts(storeId: string): Promise<ProductQuestions[]> {
  const rows = await database
    .select({
      id: questions.id,
      productId: questions.productId,
      title: products.title,
      question: questions.question,
      status: questions.status,
    })
    .from(questions)
    .innerJoin(products, eq(products.id, questions.productId))
    .where(eq(products.storeId, storeId))
    .orderBy(desc(questions.createdAt));

  return groupByProduct(rows)
    .sort((first, second) => second.totalQuestions - first.totalQuestions)
    .slice(0, MAX_RANKED_PRODUCTS);
}
