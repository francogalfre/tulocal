"use client";

import { AnimatePresence } from "motion/react";

import { ProductCard } from "@/features/store/card";
import type { CatalogProduct } from "@/features/store/catalog";
import { buildProductUrl } from "@/lib/url";

type CatalogGridProps = {
  products: CatalogProduct[];
  handle: string;
  isOwner: boolean;
};

function buildProductHref(product: CatalogProduct, handle: string, isOwner: boolean): string {
  return isOwner ? `/product/${product.id}` : `/${handle}/${product.id}`;
}

function buildShareUrl(product: CatalogProduct, handle: string, isOwner: boolean): string | null {
  if (!isOwner || product.status !== "published") {
    return null;
  }

  return buildProductUrl(handle, product.id);
}

export function CatalogGrid({ products, handle, isOwner }: CatalogGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
      <AnimatePresence mode="popLayout">
        {products.map((product, position) => (
          <ProductCard
            key={product.id}
            product={product}
            href={buildProductHref(product, handle, isOwner)}
            shareUrl={buildShareUrl(product, handle, isOwner)}
            showStatus={isOwner}
            position={position}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}
