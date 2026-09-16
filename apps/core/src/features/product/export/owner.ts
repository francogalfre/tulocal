import { isExportableProduct } from "@/features/product/export/exportable";
import { findOwnedProduct } from "@/features/product/find";
import { findCurrentSession } from "@/lib/session";
import type { ExportableProduct } from "@/features/product/export/exportable";

export async function findExportableProduct(productId: string): Promise<ExportableProduct | null> {
  const session = await findCurrentSession();

  if (session === null) {
    return null;
  }

  const product = await findOwnedProduct(productId, session.user.id);

  if (product === null || !isExportableProduct(product)) {
    return null;
  }

  return product;
}
