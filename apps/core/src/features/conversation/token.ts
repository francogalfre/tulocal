import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";

export const BUYER_TOKEN_COOKIE = "tulocal_buyer";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function readBuyerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(BUYER_TOKEN_COOKIE);

  return existing === undefined ? null : existing.value;
}

export async function ensureBuyerToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(BUYER_TOKEN_COOKIE);

  if (existing !== undefined) {
    return existing.value;
  }

  const buyerToken = randomUUID();

  cookieStore.set({
    name: BUYER_TOKEN_COOKIE,
    value: buyerToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
  });

  return buyerToken;
}
