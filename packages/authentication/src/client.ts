import { createAuthClient } from "better-auth/react";

import { webEnvironment } from "@tulocal/environment/web";

export const authenticationClient = createAuthClient({
  baseURL: webEnvironment.NEXT_PUBLIC_SERVER_URL,
});

export const useSession = authenticationClient.useSession;

export function signInWithGoogle(
  callbackURL: string,
): ReturnType<typeof authenticationClient.signIn.social> {
  return authenticationClient.signIn.social({ provider: "google", callbackURL });
}

export function signOut(): ReturnType<typeof authenticationClient.signOut> {
  return authenticationClient.signOut();
}
