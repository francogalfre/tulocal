import { z } from "zod";

const SOCIAL_HANDLE_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

function readLastPathSegment(url: string): string {
  const withoutQuery = url.split(/[?#]/)[0] ?? "";
  const segments = withoutQuery.split("/").filter((segment) => segment.length > 0);

  return segments.at(-1) ?? "";
}

export function normalizeSocialHandle(raw: string): string {
  const trimmed = raw.trim();
  const handle = trimmed.includes("/") ? readLastPathSegment(trimmed) : trimmed;

  return handle.replace(/^@/, "");
}

export const socialHandleSchema = z
  .string()
  .transform(normalizeSocialHandle)
  .pipe(z.string().regex(SOCIAL_HANDLE_PATTERN).or(z.literal("")));
