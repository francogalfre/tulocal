import { webEnvironment } from "@tulocal/environment/web";

export function buildStoreUrl(handle: string): string {
  const base = webEnvironment.NEXT_PUBLIC_APP_URL ?? webEnvironment.NEXT_PUBLIC_SERVER_URL;

  return `${base}/${handle}`;
}
