"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Count } from "@/components/count";
import {
  CONDITION_OPTIONS,
  readSingleValue,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/features/store/filters/options";
import type { FilterOption } from "@/features/store/filters/options";
import type { CatalogCategory, CatalogFilters } from "@/features/store/catalog";

type FilterFieldsProps = {
  draft: CatalogFilters;
  categories: CatalogCategory[];
  showStatus: boolean;
  onDraftChange: (draft: CatalogFilters) => void;
};

type ChoiceFieldProps<Value extends string> = {
  legend: string;
  options: FilterOption<Value>[];
  selected: Value;
  onSelect: (selected: Value) => void;
};

function toggleCategory(categories: string[], category: string): string[] {
  if (categories.includes(category)) {
    return categories.filter((existing) => existing !== category);
  }

  return [...categories, category];
}

function readPrice(entry: string): number | null {
  const digits = entry.replaceAll(/\D/g, "");

  return digits.length === 0 ? null : Number(digits);
}

function ChoiceField<Value extends string>({
  legend,
  options,
  selected,
  onSelect,
}: ChoiceFieldProps<Value>) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <ToggleGroup
        variant="outline"
        className="flex-wrap"
        value={[selected]}
        onValueChange={(values) => onSelect(readSingleValue(values, options, selected))}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} className="rounded-full px-4">
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldSet>
  );
}

export function FilterFields({ draft, categories, showStatus, onDraftChange }: FilterFieldsProps) {
  return (
    <>
      <ChoiceField
        legend="Ordenar por"
        options={SORT_OPTIONS}
        selected={draft.sort}
        onSelect={(sort) => onDraftChange({ ...draft, sort })}
      />
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
              onChange={(event) => onDraftChange({ ...draft, min: readPrice(event.target.value) })}
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
              onChange={(event) => onDraftChange({ ...draft, max: readPrice(event.target.value) })}
            />
          </Field>
        </div>
      </FieldSet>
      <ChoiceField
        legend="Estado"
        options={CONDITION_OPTIONS}
        selected={draft.condition}
        onSelect={(condition) => onDraftChange({ ...draft, condition })}
      />
      {showStatus ? (
        <ChoiceField
          legend="Publicación"
          options={STATUS_OPTIONS}
          selected={draft.status}
          onSelect={(status) => onDraftChange({ ...draft, status })}
        />
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
                    onDraftChange({
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
                    {category.label.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1">{category.label}</span>
                <Count count={category.count} className="text-muted-foreground" />
              </FieldLabel>
            ))}
          </div>
        </FieldSet>
      ) : null}
    </>
  );
}
