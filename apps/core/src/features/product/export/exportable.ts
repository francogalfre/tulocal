import type { OwnedProduct } from "@/features/product/find";

export type ExportableProduct = OwnedProduct & {
  title: string;
  listPriceInArs: number;
};

export function isExportableProduct(product: OwnedProduct): product is ExportableProduct {
  return (
    product.status === "published" && product.title !== null && product.listPriceInArs !== null
  );
}
