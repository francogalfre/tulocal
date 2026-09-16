"use client";

import { Pencil } from "lucide-react";
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
  const hasSuggestion = product.listPriceInArs !== null;
  const [isEditingPrice, setIsEditingPrice] = useState(!hasSuggestion);
  const needsWhatsapp = product.store.whatsappPhone === null;

  return (
    <form action={submit} className="flex flex-col gap-10">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="listPriceInArs" value={listPriceInArs} />
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Precio de venta</span>
          {isEditingPrice ? (
            <Input
              id="listPriceInput"
              type="number"
              inputMode="numeric"
              min={1}
              autoFocus={hasSuggestion}
              aria-label="Precio de venta"
              className="numeric h-14 font-heading text-4xl font-semibold text-brand-deep"
              value={listPriceInArs === 0 ? "" : listPriceInArs}
              onChange={(event) => setListPriceInArs(Number(event.target.value))}
              onBlur={() => setIsEditingPrice(listPriceInArs <= 0)}
              required
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingPrice(true)}
              className="group flex w-fit items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="numeric font-heading text-[3.25rem] leading-none font-semibold text-brand-deep">
                {formatArs(listPriceInArs)}
              </span>
              <Pencil
                className="size-5 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        {hasRange ? (
          <div className="flex flex-col gap-3">
            <Slider
              min={minimum}
              max={maximum}
              step={Math.max(1, Math.round((maximum - minimum) / SLIDER_STEPS))}
              value={listPriceInArs}
              onValueChange={(value) => setListPriceInArs(roundToPriceStep(readSliderValue(value)))}
              aria-label="Precio de venta"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Vender rápido</span>
              <span>Pedir más</span>
            </div>
          </div>
        ) : null}
        {hasSuggestion ? null : (
          <p className="text-sm text-muted-foreground">
            No encontramos precios parecidos. Ponele el precio que te parezca.
          </p>
        )}
      </section>
      <FieldGroup className="gap-6">
        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input
            id="title"
            name="title"
            className="h-11"
            defaultValue={product.title ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <Textarea
            id="description"
            name="description"
            defaultValue={product.description ?? ""}
            rows={7}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="floorPriceInArs">Precio mínimo</FieldLabel>
          <Input
            id="floorPriceInArs"
            name="floorPriceInArs"
            type="number"
            inputMode="numeric"
            min={1}
            className="numeric h-11"
            defaultValue={product.floorPriceInArs ?? ""}
            required
          />
          <FieldDescription>
            Es secreto. Tu vendedora negocia, pero nunca baja de acá.
          </FieldDescription>
        </Field>
        {needsWhatsapp ? (
          <Field>
            <FieldLabel htmlFor="whatsappPhone">Tu WhatsApp</FieldLabel>
            <Input
              id="whatsappPhone"
              name="whatsappPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="h-11"
              placeholder="11 2345 6789"
              required
            />
            <FieldDescription>
              Te escribimos ahí cuando aparezca un comprador en serio.
            </FieldDescription>
          </Field>
        ) : null}
      </FieldGroup>
      {state.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="xl" disabled={isPending || listPriceInArs <= 0}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "Publicando" : "Publicar"}
      </Button>
    </form>
  );
}
