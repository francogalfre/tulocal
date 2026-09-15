import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, httpLink, splitLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@tulocal/api/routers/index";
import { toast } from "sonner";

import { getServerUrl } from "@/lib/server-url";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(error.message, {
        action: {
          label: "Reintentar",
          onClick: () => {
            query.invalidate();
          },
        },
      });
    },
  }),
});

const url = `${getServerUrl()}/trpc`;
const fetchWithCredentials: typeof fetch = (input, init) =>
  fetch(input, { ...init, credentials: "include" });

/** Long-running procedures go through a plain link so they never block a batch. */
const LONG_RUNNING = new Set(["product.runPipeline"]);

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => LONG_RUNNING.has(op.path),
      true: httpLink({ url, fetch: fetchWithCredentials }),
      false: httpBatchLink({ url, fetch: fetchWithCredentials }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
