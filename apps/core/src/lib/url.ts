import { appOrigin } from "@/lib/origin";

export function buildStoreUrl(handle: string): string {
  return `${appOrigin}/${handle}`;
}
