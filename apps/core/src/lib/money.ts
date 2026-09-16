const ARS_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatArs(amountInArs: number): string {
  return ARS_FORMATTER.format(amountInArs);
}
