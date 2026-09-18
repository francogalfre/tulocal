import { revalidateTag, updateTag } from "next/cache";

export const DIRECTORY_TAG = "directory";

export function buildStoreTag(handle: string): string {
  return `store:${handle}`;
}

export function refreshPublicStore(handle: string): void {
  updateTag(buildStoreTag(handle));
  updateTag(DIRECTORY_TAG);
}

export function refreshDirectory(): void {
  updateTag(DIRECTORY_TAG);
}

export function markDirectoryStale(): void {
  revalidateTag(DIRECTORY_TAG, "max");
}
