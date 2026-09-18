import type { MetadataRoute } from "next";

import { findPublicSitemapStores } from "@/features/store/sitemap";
import { appOrigin } from "@/lib/origin";
import { buildProductUrl, buildStoreUrl } from "@/lib/url";

export const revalidate = 3600;

function buildHomeEntry(): MetadataRoute.Sitemap[number] {
  return { url: appOrigin, changeFrequency: "weekly", priority: 1 };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await findPublicSitemapStores();

  const storeEntries = stores.map((store) => ({
    url: buildStoreUrl(store.handle),
    lastModified: store.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const productEntries = stores.flatMap((store) =>
    store.products.map((product) => ({
      url: buildProductUrl(store.handle, product.id),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [buildHomeEntry(), ...storeEntries, ...productEntries];
}
