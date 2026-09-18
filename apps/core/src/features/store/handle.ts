const HANDLE_MAX_LENGTH = 30;

const HANDLE_MIN_LENGTH = 3;

const FALLBACK_HANDLE = "tienda";

const RESERVED_HANDLES = new Set(["new", "product", "store", "stores", "api", "login", "logout"]);

function stripDiacritics(text: string): string {
  return text.normalize("NFD").replaceAll(/[̀-ͯ]/g, "");
}

export function deriveHandle(name: string): string {
  const slug = stripDiacritics(name)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, HANDLE_MAX_LENGTH);

  if (slug.length < HANDLE_MIN_LENGTH || RESERVED_HANDLES.has(slug)) {
    return FALLBACK_HANDLE;
  }

  return slug;
}
