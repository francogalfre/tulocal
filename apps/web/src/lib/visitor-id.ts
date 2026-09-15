const KEY = "tulocal:visitor";

/** Stable anonymous id per browser so a visitor can resume their negotiation. */
export function getVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}
