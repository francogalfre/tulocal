"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@tulocal/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tulocal/ui/components/card";
import { Input } from "@tulocal/ui/components/input";
import { Label } from "@tulocal/ui/components/label";
import { Textarea } from "@tulocal/ui/components/textarea";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

type StoreValues = {
  name: string;
  whatsappPhone: string;
  description: string | null;
};

export function StoreSetupForm({ initial }: { initial?: StoreValues }) {
  const queryClient = useQueryClient();
  const upsert = useMutation(
    trpc.store.upsert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.store.getMine.queryKey() });
        toast.success(initial ? "Tienda actualizada" : "¡Tienda creada!");
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    upsert.mutate({
      name: String(form.get("name") ?? ""),
      whatsappPhone: String(form.get("whatsappPhone") ?? ""),
      description: String(form.get("description") ?? "") || undefined,
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{initial ? "Tu tienda" : "Creá tu tienda"}</CardTitle>
        <CardDescription>
          Solo necesitamos un nombre y tu WhatsApp para que los compradores te contacten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre de la tienda</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="Lo de Vale"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsappPhone">WhatsApp</Label>
            <Input
              id="whatsappPhone"
              name="whatsappPhone"
              required
              defaultValue={initial?.whatsappPhone}
              placeholder="+54 9 11 5555 1234"
              inputMode="tel"
            />
            <p className="text-xs text-muted-foreground">
              Con código de país. En Argentina: +54 9 y tu número sin el 15.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initial?.description ?? ""}
              placeholder="Vendo cosas que ya no uso, todo en buen estado."
              rows={3}
            />
          </div>
          <Button type="submit" disabled={upsert.isPending}>
            {upsert.isPending ? "Guardando…" : initial ? "Guardar" : "Crear tienda"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
