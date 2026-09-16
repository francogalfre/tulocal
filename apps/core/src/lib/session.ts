import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { findSession } from "@tulocal/authentication/session";
import type { Session } from "@tulocal/authentication/server";

export async function findCurrentSession(): Promise<Session | null> {
  return findSession(await headers());
}

export async function requireCurrentSession(): Promise<Session> {
  const session = await findCurrentSession();

  if (session === null) {
    redirect("/");
  }

  return session;
}
