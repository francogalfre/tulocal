const ELLIPSIS = "…";

export function truncateForPreview(text: string, maxCharacters: number): string {
  if (text.length <= maxCharacters) {
    return text;
  }

  return `${text.slice(0, maxCharacters - 1).trimEnd()}${ELLIPSIS}`;
}
