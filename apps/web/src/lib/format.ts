const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatARS(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return ars.format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}
