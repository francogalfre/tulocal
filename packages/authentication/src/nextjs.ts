import { toNextJsHandler } from "better-auth/next-js";

import { authentication } from "@tulocal/authentication/server";

export const authenticationRouteHandlers = toNextJsHandler(authentication);
