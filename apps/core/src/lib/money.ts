export const ARS_NUMBER_FORMAT = {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
} as const;

const ARS_FORMATTER = new Intl.NumberFormat("es-AR", ARS_NUMBER_FORMAT);

export function formatArs(amountInArs: number): string {
  return ARS_FORMATTER.format(amountInArs);
}
