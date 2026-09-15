import { useQuery } from "@tanstack/react-query";
import { isValidHandle } from "@tulocal/api/lib/handle";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { trpc } from "@/utils/trpc";

const HANDLE_CHECK_DELAY_MS = 350;

export type HandleAvailability =
  | "empty"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "unchecked";

export function useHandleAvailability(handle: string): HandleAvailability {
  const settledHandle = useDebouncedValue(handle, HANDLE_CHECK_DELAY_MS);
  const valid = isValidHandle(handle);
  const availability = useQuery({
    ...trpc.store.isHandleAvailable.queryOptions({ handle: settledHandle }),
    enabled: valid && settledHandle === handle,
    retry: false,
  });

  if (handle.length === 0) return "empty";
  if (!valid) return "invalid";
  if (availability.isError) return "unchecked";
  if (settledHandle !== handle || availability.data === undefined) return "checking";
  return availability.data.available ? "available" : "taken";
}
