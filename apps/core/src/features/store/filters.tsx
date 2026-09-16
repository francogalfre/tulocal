"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CatalogFilters } from "@/features/store/catalog";

const CONDITION_OPTIONS = [
  { value: "all", label: "Todo" },
  { value: "new", label: "Nuevo" },
  { value: "used", label: "Usado" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "review", label: "En revisión" },
  { value: "sold", label: "Vendidos" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Más nuevos" },
  { value: "cheapest", label: "Menor precio" },
  { value: "priciest", label: "Mayor precio" },
] as const;

type CatalogFiltersProps = {
  filters: CatalogFilters;
  showStatus: boolean;
};

export function CatalogFiltersBar({ filters, showStatus }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParameters = useSearchParams();

  function updateFilter(key: keyof CatalogFilters, value: string): void {
    const next = new URLSearchParams(searchParameters);

    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function readSingleValue(values: string[]): string | null {
    return values[0] ?? null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          variant="outline"
          value={[filters.condition]}
          onValueChange={(values) => {
            const value = readSingleValue(values);

            if (value !== null) {
              updateFilter("condition", value);
            }
          }}
          aria-label="Estado del producto"
        >
          {CONDITION_OPTIONS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Select
          items={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          value={filters.sort}
          onValueChange={(value) => updateFilter("sort", String(value))}
        >
          <SelectTrigger aria-label="Ordenar" className="ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {showStatus ? (
        <ToggleGroup
          variant="outline"
          value={[filters.status]}
          onValueChange={(values) => {
            const value = readSingleValue(values);

            if (value !== null) {
              updateFilter("status", value);
            }
          }}
          aria-label="Estado de la publicación"
        >
          {STATUS_OPTIONS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}
    </div>
  );
}
