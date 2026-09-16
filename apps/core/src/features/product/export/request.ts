"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { database } from "@tulocal/database/client";
import { scenes } from "@tulocal/database/schema/scenes";

import { isExportableProduct } from "@/features/product/export/exportable";
import { runSceneGeneration } from "@/features/product/export/run";
import { sceneFormatSchema } from "@/features/product/export/schema";
import { findOwnedProduct } from "@/features/product/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

export async function requestScene(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const format = sceneFormatSchema.safeParse(formData.get("format"));

  if (!format.success) {
    return;
  }

  const product = await findOwnedProduct(String(formData.get("productId")), session.user.id);

  if (product === null || !isExportableProduct(product)) {
    return;
  }

  await database
    .insert(scenes)
    .values({ productId: product.id, format: format.data, status: "pending", error: null })
    .onConflictDoUpdate({
      target: [scenes.productId, scenes.format],
      set: { status: "pending", error: null },
    });
  logEvent({ event: "export.scene.requested", productId: product.id, detail: format.data });
  after(() => runSceneGeneration({ productId: product.id, format: format.data }));
  revalidatePath(`/product/${product.id}/export`);
}
