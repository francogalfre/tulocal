import type { Product, ProductImage, Store } from "@tulocal/db/schema/index";

export function publicImages(product: Product, images: ProductImage[]) {
  const visible = images.filter((image) => image.visible && image.fidelityPassed !== false);
  visible.sort((a, b) => {
    if (a.id === product.coverImageId) return -1;
    if (b.id === product.coverImageId) return 1;
    return a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime();
  });
  return visible.map(({ id, url, kind }) => ({ id, url, kind }));
}

export function publicStore(store: Store) {
  return { id: store.id, name: store.name, slug: store.slug, description: store.description };
}

/** Product view for visitors. Never exposes `minPrice` or the seller's phone. */
export function publicProduct(product: Product, images: ProductImage[]) {
  return {
    id: product.id,
    title: product.title ?? "Producto",
    description: product.description ?? "",
    category: product.category,
    brand: product.brand,
    model: product.model,
    condition: product.condition,
    qualityPercent: product.qualityPercent,
    conditionNotes: product.conditionNotes,
    attributes: product.attributes,
    listPrice: product.listPrice,
    marketMinPrice: product.marketMinPrice,
    marketMaxPrice: product.marketMaxPrice,
    images: publicImages(product, images),
    createdAt: product.createdAt,
  };
}
