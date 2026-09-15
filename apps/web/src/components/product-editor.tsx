"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppRouter } from "@tulocal/api/routers/index";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tulocal/ui/components/select";
import { Switch } from "@tulocal/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tulocal/ui/components/tabs";
import { Textarea } from "@tulocal/ui/components/textarea";
import type { inferRouterOutputs } from "@trpc/server";
import { RefreshCw, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { getAppUrl } from "@/lib/app-url";
import { formatARS } from "@/lib/format";
import { trpc } from "@/utils/trpc";

import { ImageBadge } from "./image-badge";
import { LeadsList } from "./leads-list";
import { ShareCard } from "./share-card";

type Product = inferRouterOutputs<AppRouter>["product"]["get"];

const toInt = (value: string) => (value.trim() === "" ? null : Math.round(Number(value)));

export function ProductEditor({ product }: { product: Product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.product.get.queryKey({ id: product.id }) }),
      queryClient.invalidateQueries({ queryKey: trpc.product.list.queryKey() }),
    ]);

  const [form, setForm] = useState({
    title: product.title ?? "",
    description: product.description ?? "",
    condition: product.condition,
    qualityPercent: product.qualityPercent?.toString() ?? "",
    listPrice: product.listPrice?.toString() ?? "",
    minPrice: product.minPrice?.toString() ?? "",
  });

  const update = useMutation(
    trpc.product.update.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        toast.success("Guardado");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const publish = useMutation(
    trpc.product.publish.mutationOptions({
      onSuccess: async (data) => {
        await invalidate();
        toast.success(data.published ? "¡Publicado! Ya podés compartirlo." : "Despublicado");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const setImage = useMutation(
    trpc.product.setImage.mutationOptions({
      onSuccess: invalidate,
      onError: (error) => toast.error(error.message),
    }),
  );
  const refreshPrices = useMutation(
    trpc.product.refreshPrices.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        toast.success("Precios de mercado actualizados");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    trpc.product.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.product.list.queryKey() });
        router.push("/dashboard");
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update.mutate({
      id: product.id,
      title: form.title,
      description: form.description,
      condition: form.condition,
      qualityPercent: toInt(form.qualityPercent),
      listPrice: toInt(form.listPrice),
      minPrice: toInt(form.minPrice),
    });
  }

  const productUrl = `${getAppUrl()}/s/${product.store.slug}/p/${product.id}`;
  const publicImages = product.images.filter(
    (image) => image.visible && image.fidelityPassed !== false,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.title ?? "Producto"}</h1>
          <p className="text-sm text-muted-foreground">
            {formatARS(product.listPrice)} · {product.conversationCount} conversaciones
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={product.published}
            disabled={publish.isPending}
            onCheckedChange={(checked) => publish.mutate({ id: product.id, published: checked })}
          />
          {product.published ? "Publicado" : "Borrador"}
        </label>
      </div>

      {product.pipelineError && (
        <p className="border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          Parte del procesamiento falló: {product.pipelineError}
        </p>
      )}

      <Tabs defaultValue="product">
        <TabsList>
          <TabsTrigger value="product">Producto</TabsTrigger>
          <TabsTrigger value="images">Imágenes ({publicImages.length})</TabsTrigger>
          <TabsTrigger value="share">Compartir</TabsTrigger>
          <TabsTrigger value="leads">Conversaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="product">
          <form onSubmit={save} className="grid gap-6 md:grid-cols-[1fr_18rem]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={8}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Condición</Label>
                  <Select
                    value={form.condition}
                    onValueChange={(value) =>
                      setForm({ ...form, condition: value as "new" | "used" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="used">Usado</SelectItem>
                      <SelectItem value="new">Nuevo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="quality">Estado (%)</Label>
                  <Input
                    id="quality"
                    type="number"
                    min={0}
                    max={100}
                    value={form.qualityPercent}
                    onChange={(e) => setForm({ ...form, qualityPercent: e.target.value })}
                  />
                </div>
              </div>
              {product.conditionNotes.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Detalles detectados:</span>{" "}
                  {product.conditionNotes.join(" · ")}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? "Guardando…" : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm("¿Eliminar este producto? No se puede deshacer.")) {
                      remove.mutate({ id: product.id });
                    }
                  }}
                >
                  <Trash2 data-icon="inline-start" />
                  Eliminar
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Precios</CardTitle>
                  <CardDescription>En pesos argentinos, sin centavos.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="listPrice">Precio de lista</Label>
                    <Input
                      id="listPrice"
                      type="number"
                      min={0}
                      step={1}
                      value={form.listPrice}
                      onChange={(e) => setForm({ ...form, listPrice: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="minPrice">Precio mínimo (oculto)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min={0}
                      step={1}
                      value={form.minPrice}
                      onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      El vendedor virtual nunca baja de acá ni lo revela. Si lo dejás vacío, usa el
                      80% del precio de lista.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>Referencia de mercado</CardTitle>
                  <CardDescription>
                    {product.marketMinPrice !== null || product.marketMaxPrice !== null
                      ? `${formatARS(product.marketMinPrice)} a ${formatARS(product.marketMaxPrice)}`
                      : "No encontramos precios comparables."}
                  </CardDescription>
                </CardHeader>
                {(product.marketSummary || product.marketSources.length > 0) && (
                  <CardContent className="flex flex-col gap-2 text-xs">
                    {product.marketSummary && (
                      <p className="text-muted-foreground">{product.marketSummary}</p>
                    )}
                    <ul className="flex flex-col gap-1">
                      {product.marketSources.map((source) => (
                        <li key={source.url} className="flex justify-between gap-2">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate underline"
                          >
                            {source.title}
                          </a>
                          <span className="shrink-0 text-muted-foreground">
                            {formatARS(source.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
                <CardContent>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={refreshPrices.isPending}
                    onClick={() => refreshPrices.mutate({ id: product.id })}
                  >
                    <RefreshCw data-icon="inline-start" />
                    {refreshPrices.isPending ? "Buscando…" : "Buscar precios de nuevo"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="images">
          <p className="mb-3 text-xs text-muted-foreground">
            Las imágenes generadas pasan por una verificación que compara con la foto original. Las
            que no pasan quedan ocultas por defecto; podés revisarlas y mostrarlas igual bajo tu
            responsabilidad.
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {product.images.map((image) => {
              const isCover = image.id === product.coverImageId;
              return (
                <li key={image.id} className="flex flex-col gap-2">
                  <div
                    className={`relative aspect-square overflow-hidden bg-muted ${image.visible ? "" : "opacity-50"}`}
                  >
                    <img src={image.url} alt="" className="size-full object-cover" />
                    <ImageBadge kind={image.kind} fidelityPassed={image.fidelityPassed} />
                    {isCover && (
                      <Star className="absolute top-1 right-1 size-4 fill-yellow-400 text-yellow-500" />
                    )}
                  </div>
                  {image.fidelityIssues.length > 0 && (
                    <p className="text-[11px] text-destructive">
                      {image.fidelityIssues.join(" · ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <label className="flex items-center gap-1.5">
                      <Switch
                        size="sm"
                        checked={image.visible}
                        onCheckedChange={(visible) =>
                          setImage.mutate({ id: product.id, imageId: image.id, visible })
                        }
                      />
                      Visible
                    </label>
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={isCover || !image.visible}
                      onClick={() =>
                        setImage.mutate({ id: product.id, imageId: image.id, cover: true })
                      }
                    >
                      Portada
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="share">
          {product.published ? (
            <ShareCard
              title="Este producto"
              description="Link y QR directos a la publicación."
              url={productUrl}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Publicá el producto para compartirlo.</p>
          )}
        </TabsContent>

        <TabsContent value="leads">
          <LeadsList productId={product.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
