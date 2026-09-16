import { appOrigin } from "@/lib/origin";

export function buildStoreUrl(handle: string): string {
  return `${appOrigin}/${handle}`;
}

export function buildProductUrl(handle: string, productId: string): string {
  return `${buildStoreUrl(handle)}/${productId}`;
}
