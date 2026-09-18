"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { findOwnedProduct } from "@/features/product/find";
import { runPipeline } from "@/features/product/pipeline/run";
import { requireCurrentSession } from "@/lib/session";

export async function retryPipeline(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const productId = String(formData.get("productId"));
  const product = await findOwnedProduct(productId, session.user.id);

  if (product === null || product.status !== "failed") {
    return;
  }

  after(() => runPipeline(product.id));
  revalidatePath(`/product/${product.id}`);
}
