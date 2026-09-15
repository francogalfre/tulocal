import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@tulocal/api/routers/index";

import { getServerUrl } from "./server-url";

/** Cookie-less tRPC client for React Server Components (public procedures only). */
export const serverTrpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getServerUrl()}/trpc`,
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    }),
  ],
});
