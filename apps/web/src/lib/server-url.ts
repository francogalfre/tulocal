const DEFAULT_SERVER_URL = "http://localhost:3000";

/**
 * Resolve the API origin. `NEXT_PUBLIC_SERVER_URL` is either an absolute URL
 * (local dev) or a path like `/api` (Vercel, where the server is a sibling
 * service behind the same origin).
 */
export function getServerUrl() {
  const configured = (process.env.NEXT_PUBLIC_SERVER_URL || DEFAULT_SERVER_URL).replace(/\/$/, "");

  if (!configured.startsWith("/")) {
    return configured;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${configured}`;
  }

  const vercelUrl =
    process.env.VERCEL_ENV === "production"
      ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
      : (process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (vercelUrl) {
    const origin = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return `${origin}${configured}`;
  }

  return `${DEFAULT_SERVER_URL}${configured}`;
}
