"use client";

import { Camera } from "lucide-react";
import { useActionState, useState } from "react";
import type { ChangeEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { updateStore } from "@/features/store/update";
import type { Store } from "@/features/store/find";
import type { UpdateStoreState } from "@/features/store/update";

const INITIAL_STATE: UpdateStoreState = { error: null };

type StoreEditFormProps = {
  store: Store;
};

function readPreviewUrl(event: ChangeEvent<HTMLInputElement>): string | null {
  const file = event.target.files?.[0];

  if (file === undefined) {
    return null;
  }

  return URL.createObjectURL(file);
}

export function StoreEditForm({ store }: StoreEditFormProps) {
  const [state, submit, isPending] = useActionState(updateStore, INITIAL_STATE);
  const [bannerPreview, setBannerPreview] = useState(store.bannerUrl);
  const [avatarPreview, setAvatarPreview] = useState(store.avatarUrl);

  return (
    <form action={submit} className="flex flex-col gap-8">
      <div className="flex flex-col">
        <label
          htmlFor="banner"
          className="relative flex aspect-[3/1] cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-secondary text-sm font-medium transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50"
        >
          {bannerPreview !== null ? (
            <img src={bannerPreview} alt="" className="absolute inset-0 size-full object-cover" />
          ) : null}
          <span className="relative inline-flex items-center gap-2 rounded-lg bg-background/90 px-3 py-1.5">
            <Camera className="size-4" aria-hidden="true" />
            {bannerPreview === null ? "Agregar portada" : "Cambiar portada"}
          </span>
          <input
            id="banner"
            name="banner"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => setBannerPreview(readPreviewUrl(event) ?? bannerPreview)}
          />
        </label>
        <label
          htmlFor="avatar"
          className="group -mt-10 ml-4 w-fit cursor-pointer rounded-full focus-within:ring-3 focus-within:ring-ring/50"
        >
          <Avatar className="size-20 border-4 border-background">
            {avatarPreview !== null ? <AvatarImage src={avatarPreview} alt="" /> : null}
            <AvatarFallback className="bg-brand-deep font-heading text-2xl font-semibold text-white">
              {store.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Cambiar foto de perfil</span>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => setAvatarPreview(readPreviewUrl(event) ?? avatarPreview)}
          />
        </label>
        <p className="px-4 pt-2 text-sm text-muted-foreground">
          Tocá la portada o la foto para cambiarlas.
        </p>
      </div>
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
            rows={4}
            placeholder="Qué vendés, de dónde sos, cómo entregás."
            defaultValue={store.description ?? ""}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="whatsappPhone">WhatsApp</FieldLabel>
          <Input
            id="whatsappPhone"
            name="whatsappPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="h-11"
            placeholder="11 2345 6789"
            defaultValue={store.whatsappPhone ?? ""}
          />
          <FieldDescription>
            Te avisamos acá cuando aparezca un comprador en serio.
          </FieldDescription>
        </Field>
      </FieldGroup>
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
