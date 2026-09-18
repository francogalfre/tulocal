const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
