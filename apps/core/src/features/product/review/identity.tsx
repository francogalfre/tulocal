"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import type { OwnedProduct } from "@/features/product/find";

type IdentityFieldsProps = {
  product: OwnedProduct;
};

export function IdentityFields({ product }: IdentityFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="category">Categoría</FieldLabel>
          <Select name="category" defaultValue={product.category} items={CATEGORY_LABELS} required>
            <SelectTrigger id="category" className="h-11 w-full">
              <SelectValue placeholder="Elegí una" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="condition">Estado</FieldLabel>
          <Select
            name="condition"
            defaultValue={product.condition}
            items={CONDITION_LABELS}
            required
          >
            <SelectTrigger id="condition" className="h-11 w-full">
              <SelectValue placeholder="Elegí uno" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="brand">Marca</FieldLabel>
          <Input
            id="brand"
            name="brand"
            className="h-11"
            defaultValue={product.brand ?? ""}
            placeholder="Sin marca"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="model">Modelo</FieldLabel>
          <Input
            id="model"
            name="model"
            className="h-11"
            defaultValue={product.model ?? ""}
            placeholder="Sin modelo"
          />
        </Field>
      </div>
    </>
  );
}
