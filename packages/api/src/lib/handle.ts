export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;
export const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
export const HANDLE_FORMAT_MESSAGE = "solo letras, números y guiones";

export function toHandle(name: string) {
  return name
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, HANDLE_MAX_LENGTH);
}

export function isValidHandle(handle: string) {
  return (
    handle.length >= HANDLE_MIN_LENGTH &&
    handle.length <= HANDLE_MAX_LENGTH &&
    HANDLE_PATTERN.test(handle)
  );
}
