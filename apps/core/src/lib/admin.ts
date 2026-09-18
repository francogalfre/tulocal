import { redirect } from "next/navigation";

import type { Session } from "@tulocal/authentication/server";
import { serverEnvironment } from "@tulocal/environment/server";

import { requireCurrentSession } from "@/lib/session";

const superadminEmails = new Set(
  serverEnvironment.SUPERADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email !== ""),
);

export function isSuperadminEmail(email: string): boolean {
  return superadminEmails.has(email.toLowerCase());
}

export async function requireSuperadminSession(): Promise<Session> {
  const session = await requireCurrentSession();

  if (!isSuperadminEmail(session.user.email)) {
    redirect("/");
  }

  return session;
}
