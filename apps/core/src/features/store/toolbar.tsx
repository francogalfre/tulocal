"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  countActiveFilters,
  DEFAULT_CATALOG_FILTERS,
  serializeCatalogFilters,
} from "@/features/store/catalog";
import type { CatalogCategory, CatalogFilters } from "@/features/store/catalog";

const SORT_OPTIONS = [
  { value: "newest", label: "Más nuevos" },
  { value: "cheapest", label: "Precio: menor a mayor" },
  { value: "priciest", label: "Precio: mayor a menor" },
] as const;

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

type CatalogToolbarProps = {
  filters: CatalogFilters;
  categories: CatalogCategory[];
  showStatus: boolean;
};

function toggleCategory(categories: string[], category: string): string[] {
  if (categories.includes(category)) {
    return categories.filter((existing) => existing !== category);
  }

  return [...categories, category];
}

function readPrice(value: string): number | null {
  const digits = value.replaceAll(/\D/g, "");

  return digits.length === 0 ? null : Number(digits);
}

export function CatalogToolbar({ filters, categories, showStatus }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function navigate(next: CatalogFilters): void {
    const query = serializeCatalogFilters(next);

    router.replace(query.length === 0 ? pathname : `${pathname}?${query}`, { scroll: false });
  }

  function handleOpenChange(open: boolean): void {
    if (open) {
      setDraft(filters);
    }

    setIsOpen(open);
  }

  function applyDraft(): void {
    navigate(draft);
    setIsOpen(false);
  }

  function clearAll(): void {
    setDraft(DEFAULT_CATALOG_FILTERS);
    navigate(DEFAULT_CATALOG_FILTERS);
    setIsOpen(false);
  }

  return (
    <div className="-mx-5 flex items-center gap-3 overflow-x-auto px-5 py-1 [scrollbar-width:none]">
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              className="relative shrink-0"
              aria-label="Filtros"
            />
          }
        >
          <SlidersHorizontal />
          {activeCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-deep font-heading text-xs font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </SheetTrigger>
        <SheetContent
          side="left"
          className="gap-0 data-[side=left]:w-full data-[side=left]:sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl">Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4">
            <FieldSet>
              <FieldLegend variant="label">Ordenar por</FieldLegend>
              <ToggleGroup
                variant="outline"
                className="flex-wrap"
                value={[draft.sort]}
                onValueChange={(values) =>
                  setDraft({ ...draft, sort: readSingleValueSort(values, draft.sort) })
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="rounded-full px-4"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Precio</FieldLegend>
              <div className="flex items-center gap-3">
                <Field className="flex-1">
                  <FieldLabel htmlFor="minimumPrice" className="sr-only">
                    Precio mínimo
                  </FieldLabel>
                  <Input
                    id="minimumPrice"
                    inputMode="numeric"
                    placeholder="$ Desde"
                    className="numeric h-11"
                    value={draft.min ?? ""}
                    onChange={(event) => setDraft({ ...draft, min: readPrice(event.target.value) })}
                  />
                </Field>
                <span className="text-muted-foreground">a</span>
                <Field className="flex-1">
                  <FieldLabel htmlFor="maximumPrice" className="sr-only">
                    Precio máximo
                  </FieldLabel>
                  <Input
                    id="maximumPrice"
                    inputMode="numeric"
                    placeholder="$ Hasta"
                    className="numeric h-11"
                    value={draft.max ?? ""}
                    onChange={(event) => setDraft({ ...draft, max: readPrice(event.target.value) })}
                  />
                </Field>
              </div>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Estado</FieldLegend>
              <ToggleGroup
                variant="outline"
                className="flex-wrap"
                value={[draft.condition]}
                onValueChange={(values) =>
                  setDraft({
                    ...draft,
                    condition: readSingleValueCondition(values, draft.condition),
                  })
                }
              >
                {CONDITION_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="rounded-full px-4"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>
            {showStatus ? (
              <FieldSet>
                <FieldLegend variant="label">Publicación</FieldLegend>
                <ToggleGroup
                  variant="outline"
                  className="flex-wrap"
                  value={[draft.status]}
                  onValueChange={(values) =>
                    setDraft({ ...draft, status: readSingleValueStatus(values, draft.status) })
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      className="rounded-full px-4"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            ) : null}
            {categories.length > 0 ? (
              <FieldSet>
                <FieldLegend variant="label">Categoría</FieldLegend>
                <div className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <FieldLabel
                      key={category.name}
                      htmlFor={`category-${category.name}`}
                      className="flex w-full items-center gap-3 rounded-lg py-2 font-normal"
                    >
                      <Checkbox
                        id={`category-${category.name}`}
                        checked={draft.category.includes(category.name)}
                        onCheckedChange={() =>
                          setDraft({
                            ...draft,
                            category: toggleCategory(draft.category, category.name),
                          })
                        }
                      />
                      <Avatar className="size-7">
                        {category.coverUrl !== null ? (
                          <AvatarImage src={category.coverUrl} alt="" />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {category.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 capitalize">{category.name}</span>
                      <span className="numeric text-muted-foreground">{category.count}</span>
                    </FieldLabel>
                  ))}
                </div>
              </FieldSet>
            ) : null}
          </div>
          <SheetFooter className="flex-row gap-3 border-t">
            <Button variant="outline" size="xl" className="flex-1" onClick={clearAll}>
              Limpiar todo
            </Button>
            <Button size="xl" className="flex-1" onClick={applyDraft}>
              Aplicar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {categories.length > 0 ? <Separator orientation="vertical" className="h-6 shrink-0" /> : null}
      {categories.map((category) => (
        <Toggle
          key={category.name}
          variant="outline"
          size="lg"
          className="h-11 shrink-0 gap-2 rounded-full pr-4 pl-1.5"
          pressed={filters.category.includes(category.name)}
          onPressedChange={() =>
            navigate({ ...filters, category: toggleCategory(filters.category, category.name) })
          }
        >
          <Avatar className="size-8">
            {category.coverUrl !== null ? <AvatarImage src={category.coverUrl} alt="" /> : null}
            <AvatarFallback className="text-xs">
              {category.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="capitalize">{category.name}</span>
        </Toggle>
      ))}
    </div>
  );
}

function readSingleValueSort(
  values: string[],
  fallback: CatalogFilters["sort"],
): CatalogFilters["sort"] {
  const value = values[0];

  return value !== undefined && isSort(value) ? value : fallback;
}

function readSingleValueCondition(
  values: string[],
  fallback: CatalogFilters["condition"],
): CatalogFilters["condition"] {
  const value = values[0];

  return value !== undefined && isCondition(value) ? value : fallback;
}

function readSingleValueStatus(
  values: string[],
  fallback: CatalogFilters["status"],
): CatalogFilters["status"] {
  const value = values[0];

  return value !== undefined && isStatus(value) ? value : fallback;
}

function isSort(value: string): value is CatalogFilters["sort"] {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function isCondition(value: string): value is CatalogFilters["condition"] {
  return CONDITION_OPTIONS.some((option) => option.value === value);
}

function isStatus(value: string): value is CatalogFilters["status"] {
  return STATUS_OPTIONS.some((option) => option.value === value);
}
