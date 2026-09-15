"use client";

import { useMutation } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { toHandle } from "@tulocal/api/lib/handle";
import type { AppRouter } from "@tulocal/api/routers/index";
import { Button } from "@tulocal/ui/components/button";
import { Input } from "@tulocal/ui/components/input";
import { Label } from "@tulocal/ui/components/label";
import { Spinner } from "@tulocal/ui/components/spinner";
import { useState } from "react";

import { HandleField } from "@/app/onboarding/handle-field";
import { useHandleAvailability } from "@/app/onboarding/use-handle-availability";
import { trpc } from "@/utils/trpc";

export type CreatedStore = inferRouterOutputs<AppRouter>["store"]["create"];

const NAME_MIN_LENGTH = 2;

export function CreateStoreForm({ onCreated }: { onCreated: (store: CreatedStore) => void }) {
  const [name, setName] = useState("");
  const [customHandle, setCustomHandle] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handle = customHandle ?? toHandle(name);
  const availability = useHandleAvailability(handle);

  const createStore = useMutation(
    trpc.store.create.mutationOptions({
      onSuccess: onCreated,
      onError: (error) => setSubmitError(error.message),
    }),
  );

  const canSubmit =
    name.trim().length >= NAME_MIN_LENGTH &&
    whatsappPhone.trim().length > 0 &&
    (availability === "available" || availability === "unchecked");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    createStore.mutate({ name, handle, whatsappPhone });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <h1 className="text-title">ponele nombre a tu tienda.</h1>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">nombre</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="lo de martina"
            autoComplete="organization"
            autoFocus
            required
            minLength={NAME_MIN_LENGTH}
          />
        </div>

        <HandleField value={handle} availability={availability} onChange={setCustomHandle} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="whatsappPhone">tu WhatsApp</Label>
          <Input
            id="whatsappPhone"
            name="whatsappPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsappPhone}
            onChange={(event) => setWhatsappPhone(event.target.value)}
            placeholder="+54 9 11 5555 1234"
            required
          />
          <p className="text-label text-muted-foreground">
            con código de país, sin el 15. ahí te escriben los compradores.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-[360px]"
          disabled={!canSubmit || createStore.isPending}
        >
          {createStore.isPending && <Spinner />}
          crear mi tienda
        </Button>
        {submitError && (
          <p role="alert" className="text-label text-warning-deep">
            {submitError}
          </p>
        )}
      </div>
    </form>
  );
}
