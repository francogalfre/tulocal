"use client";

import { useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { roundToPriceStep } from "@/features/product/pipeline/pricing";
import { publishProduct } from "@/features/product/publish";
import type { OwnedProduct } from "@/features/product/find";
import type { PublishProductState } from "@/features/product/publish";
import { formatArs } from "@/lib/money";

const INITIAL_STATE: PublishProductState = { error: null };

const SLIDER_STEPS = 100;

type ReviewFormProps = {
  product: OwnedProduct;
};

function readSliderValue(value: number | readonly number[]): number {
  if (Array.isArray(value)) {
    return value[0] ?? 0;
  }

  return Number(value);
}

export function ReviewForm({ product }: ReviewFormProps) {
  const [state, submit, isPending] = useActionState(publishProduct, INITIAL_STATE);
  const [listPriceInArs, setListPriceInArs] = useState(product.listPriceInArs ?? 0);
  const minimum = product.suggestedMinimumPriceInArs;
  const maximum = product.suggestedMaximumPriceInArs;
  const hasRange = minimum !== null && maximum !== null && minimum < maximum;
  const needsWhatsapp = product.store.whatsappPhone === null;

  return (
    <form action={submit} className="flex flex-col gap-8">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="listPriceInArs" value={listPriceInArs} />
      <div className="flex flex-col gap-4">
        <p className="font-heading text-5xl font-semibold text-primary">
          {formatArs(listPriceInArs)}
        </p>
        {hasRange ? (
          <div className="flex flex-col gap-2">
            <Slider
              min={minimum}
              max={maximum}
              step={Math.max(1, Math.round((maximum - minimum) / SLIDER_STEPS))}
              value={listPriceInArs}
              onValueChange={(value) => setListPriceInArs(roundToPriceStep(readSliderValue(value)))}
              aria-label="precio de venta"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>vender rápido</span>
              <span>pedir más</span>
            </div>
          </div>
        ) : (
          <Field>
            <FieldLabel htmlFor="listPriceInput">precio de venta</FieldLabel>
            <Input
              id="listPriceInput"
              type="number"
              inputMode="numeric"
              min={1}
              value={listPriceInArs === 0 ? "" : listPriceInArs}
              onChange={(event) => setListPriceInArs(Number(event.target.value))}
              required
            />
            <FieldDescription>no encontramos precios parecidos, ponelo vos.</FieldDescription>
          </Field>
        )}
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">título</FieldLabel>
          <Input id="title" name="title" defaultValue={product.title ?? ""} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">descripción</FieldLabel>
          <Textarea
            id="description"
            name="description"
            defaultValue={product.description ?? ""}
            rows={6}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="floorPriceInArs">precio mínimo</FieldLabel>
          <Input
            id="floorPriceInArs"
            name="floorPriceInArs"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={product.floorPriceInArs ?? ""}
            required
          />
          <FieldDescription>nadie lo ve. tu vendedora nunca baja de acá.</FieldDescription>
        </Field>
        {needsWhatsapp ? (
          <Field>
            <FieldLabel htmlFor="whatsappPhone">tu WhatsApp</FieldLabel>
            <Input
              id="whatsappPhone"
              name="whatsappPhone"
              type="tel"
              inputMode="tel"
              placeholder="11 2345 6789"
              required
            />
            <FieldDescription>
              te escribimos ahí cuando aparezca un comprador en serio.
            </FieldDescription>
          </Field>
        ) : null}
      </FieldGroup>
      {state.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending || listPriceInArs <= 0}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        publicar
      </Button>
    </form>
  );
}
