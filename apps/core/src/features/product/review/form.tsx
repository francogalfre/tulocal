"use client";

import { useActionState, useState } from "react";

import { Phone } from "@/components/phone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { roundToPriceStep } from "@/features/product/pipeline/pricing";
import { publishProduct } from "@/features/product/publish";
import { FloorField } from "@/features/product/review/floor";
import { IdentityFields } from "@/features/product/review/identity";
import { PriceField } from "@/features/product/review/price";
import { updateProduct } from "@/features/product/update";
import type { OwnedProduct } from "@/features/product/find";
import type { PublishProductState } from "@/features/product/publish";

const INITIAL_STATE: PublishProductState = { error: null };

const DEFAULT_FLOOR_RATIO = 0.8;

const MODES = {
  publish: { action: publishProduct, idle: "Publicar", busy: "Publicando" },
  edit: { action: updateProduct, idle: "Guardar cambios", busy: "Guardando" },
};

type ReviewFormProps = {
  product: OwnedProduct;
  mode: keyof typeof MODES;
};

function selectInitialFloor(product: OwnedProduct): number {
  if (product.floorPriceInArs !== null) {
    return product.floorPriceInArs;
  }

  if (product.listPriceInArs === null) {
    return 0;
  }

  return roundToPriceStep(product.listPriceInArs * DEFAULT_FLOOR_RATIO);
}

export function ReviewForm({ product, mode }: ReviewFormProps) {
  const [state, submit, isPending] = useActionState(MODES[mode].action, INITIAL_STATE);
  const [listPriceInArs, setListPriceInArs] = useState(product.listPriceInArs ?? 0);
  const [floorPriceInArs, setFloorPriceInArs] = useState(selectInitialFloor(product));
  const needsWhatsapp = mode === "publish" && product.store.whatsappPhone === null;
  const canSubmit = listPriceInArs > 0 && floorPriceInArs > 0 && floorPriceInArs <= listPriceInArs;

  function changeListPrice(next: number): void {
    setListPriceInArs(next);

    if (next > 0 && floorPriceInArs > next) {
      setFloorPriceInArs(next);
    }
  }

  return (
    <form action={submit} className="flex flex-col gap-10">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="listPriceInArs" value={listPriceInArs} />
      <input type="hidden" name="floorPriceInArs" value={floorPriceInArs} />
      <PriceField
        listPriceInArs={listPriceInArs}
        suggestedMinimumPriceInArs={product.suggestedMinimumPriceInArs}
        suggestedMaximumPriceInArs={product.suggestedMaximumPriceInArs}
        hasSuggestion={product.listPriceInArs !== null}
        onChange={changeListPrice}
      />
      <FloorField
        floorPriceInArs={floorPriceInArs}
        listPriceInArs={listPriceInArs}
        onChange={setFloorPriceInArs}
      />
      <FieldGroup className="gap-6">
        <IdentityFields product={product} />
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
        {needsWhatsapp ? (
          <Field>
            <FieldLabel htmlFor="whatsappPhone">Tu WhatsApp</FieldLabel>
            <Phone id="whatsappPhone" name="whatsappPhone" defaultValue={null} isRequired />
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
      <Button type="submit" size="xl" disabled={isPending || !canSubmit}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? MODES[mode].busy : MODES[mode].idle}
      </Button>
    </form>
  );
}
