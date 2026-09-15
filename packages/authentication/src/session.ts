import { authentication } from "@tulocal/authentication/server";
import type { Session } from "@tulocal/authentication/server";

export class UnauthenticatedError extends Error {
  constructor() {
    super("There is no active session for this request");
    this.name = "UnauthenticatedError";
  }
}

export async function findSession(headers: Headers): Promise<Session | null> {
  return authentication.api.getSession({ headers });
}

export async function requireSession(headers: Headers): Promise<Session> {
  const session = await findSession(headers);

  if (session === null) {
    throw new UnauthenticatedError();
  }

  return session;
}
