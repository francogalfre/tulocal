"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { startSubscription } from "@/features/plan/subscription/checkout";
import { formatArs } from "@/lib/money";
import type { PaidPlan } from "@/features/plan/catalog";
import type { CheckoutState } from "@/features/plan/subscription/checkout";

const INITIAL_STATE: CheckoutState = { error: null };

type SubscribeProps = {
  plan: PaidPlan;
  planName: string;
  priceInArs: number;
  suggestedEmail: string;
  isHighlighted: boolean;
};

export function Subscribe({
  plan,
  planName,
  priceInArs,
  suggestedEmail,
  isHighlighted,
}: SubscribeProps) {
  const [state, submit, isPending] = useActionState(startSubscription, INITIAL_STATE);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="xl" variant={isHighlighted ? "default" : "outline"} />}>
        Pasarme a {planName}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suscribite a {planName}</DialogTitle>
          <DialogDescription>
            {formatArs(priceInArs)} por mes con Mercado Pago. Cancelás cuando quieras.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4">
          <input type="hidden" name="plan" value={plan} />
          <Field>
            <FieldLabel htmlFor={`payer-email-${plan}`}>Mail de Mercado Pago</FieldLabel>
            <Input
              id={`payer-email-${plan}`}
              name="payerEmail"
              type="email"
              required
              defaultValue={suggestedEmail}
              autoComplete="email"
              className="h-11"
            />
            <FieldDescription>
              Tiene que ser el mail con el que entrás a Mercado Pago, si no el pago no pasa.
            </FieldDescription>
          </Field>
          {state.error !== null ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" size="xl" disabled={isPending}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {isPending ? "Abriendo Mercado Pago" : "Ir a Mercado Pago"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
