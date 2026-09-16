import { CONDITION_LABELS } from "@/features/product/condition";
import type { CatalogFilters } from "@/features/store/catalog";

export type FilterOption<Value extends string> = {
  value: Value;
  label: string;
};

export const SORT_OPTIONS: FilterOption<CatalogFilters["sort"]>[] = [
  { value: "newest", label: "Más nuevos" },
  { value: "cheapest", label: "Precio: menor a mayor" },
  { value: "priciest", label: "Precio: mayor a menor" },
];

export const CONDITION_OPTIONS: FilterOption<CatalogFilters["condition"]>[] = [
  { value: "all", label: "Todo" },
  { value: "new", label: CONDITION_LABELS.new },
  { value: "like_new", label: CONDITION_LABELS.like_new },
  { value: "good", label: CONDITION_LABELS.good },
  { value: "worn", label: CONDITION_LABELS.worn },
];

export const STATUS_OPTIONS: FilterOption<CatalogFilters["status"]>[] = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "review", label: "En revisión" },
  { value: "sold", label: "Vendidos" },
];

export function readSingleValue<Value extends string>(
  values: string[],
  options: FilterOption<Value>[],
  fallback: Value,
): Value {
  const selected = options.find((option) => option.value === values[0]);

  return selected === undefined ? fallback : selected.value;
}
