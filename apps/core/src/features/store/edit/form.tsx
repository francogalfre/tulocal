"use client";

import { useActionState } from "react";

import { Phone } from "@/components/phone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { AgentFields } from "@/features/store/edit/agent";
import { StoreImagesFields } from "@/features/store/edit/images";
import { LocationPicker } from "@/features/store/location/picker";
import { readStoredPlace } from "@/features/store/location/place";
import { SocialFields } from "@/features/store/social/fields";
import { updateStore } from "@/features/store/update";
import type { Store } from "@/features/store/find";
import type { UpdateStoreState } from "@/features/store/update";

const INITIAL_STATE: UpdateStoreState = { error: null };

type StoreEditFormProps = {
  store: Store;
};

export function StoreEditForm({ store }: StoreEditFormProps) {
  const [state, submit, isPending] = useActionState(updateStore, INITIAL_STATE);

  return (
    <form action={submit} className="flex flex-col gap-8">
      <StoreImagesFields
        name={store.name}
        avatarUrl={store.avatarUrl}
        bannerUrl={store.bannerUrl}
      />
      <FieldGroup className="gap-6">
        <Field>
          <FieldLabel htmlFor="name">Nombre de la tienda</FieldLabel>
          <Input id="name" name="name" className="h-11" defaultValue={store.name} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={5}
            className="min-h-24 resize-none"
            placeholder="Qué vendés, de dónde sos, cómo entregás."
            defaultValue={store.description ?? ""}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="whatsappPhone">WhatsApp</FieldLabel>
          <Phone id="whatsappPhone" name="whatsappPhone" defaultValue={store.whatsappPhone} />
          <FieldDescription>
            Te avisamos acá cuando aparezca un comprador en serio.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <Separator />
      <SocialFields handles={store} />
      <Separator />
      <AgentFields agentName={store.agentName} />
      <Separator />
      <LocationPicker initialPlace={readStoredPlace(store)} />
      {state.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="xl" disabled={isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "Guardando" : "Guardar cambios"}
      </Button>
    </form>
  );
}
