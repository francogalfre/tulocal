"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@tulocal/ui/components/badge";
import { Button } from "@tulocal/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@tulocal/ui/components/empty";
import { Skeleton } from "@tulocal/ui/components/skeleton";
import { Plus, Settings, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ShareCard } from "@/components/share-card";
import { StoreSetupForm } from "@/components/store-setup-form";
import { getAppUrl } from "@/lib/app-url";
import { formatARS } from "@/lib/format";
import { trpc } from "@/utils/trpc";

const STATUS = {
  processing: { label: "Procesando", variant: "secondary" },
  ready: { label: "Listo", variant: "outline" },
  failed: { label: "Falló", variant: "destructive" },
} as const;

export default function DashboardPage() {
  const storeQuery = useQuery(trpc.store.getMine.queryOptions());
  const store = storeQuery.data;
  const productsQuery = useQuery({ ...trpc.product.list.queryOptions(), enabled: !!store });
  const [panel, setPanel] = useState<"none" | "settings" | "share">("none");

  if (storeQuery.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!store) {
    return <StoreSetupForm />;
  }

  const storeUrl = `${getAppUrl()}/s/${store.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline"
          >
            {storeUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPanel(panel === "share" ? "none" : "share")}
          >
            <Share2 data-icon="inline-start" />
            Compartir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPanel(panel === "settings" ? "none" : "settings")}
          >
            <Settings data-icon="inline-start" />
            Tienda
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/products/new" />}>
            <Plus data-icon="inline-start" />
            Nuevo producto
          </Button>
        </div>
      </div>

      {panel === "share" && (
        <ShareCard
          title="Tu tienda"
          description="Compartí este link o QR con tus compradores."
          url={storeUrl}
        />
      )}
      {panel === "settings" && (
        <StoreSetupForm
          initial={{
            name: store.name,
            whatsappPhone: store.whatsappPhone,
            description: store.description,
          }}
        />
      )}

      {productsQuery.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : !productsQuery.data || productsQuery.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Todavía no tenés productos</EmptyTitle>
            <EmptyDescription>
              Subí unas fotos y en un minuto tenés la publicación lista.
            </EmptyDescription>
          </EmptyHeader>
          <Button nativeButton={false} render={<Link href="/dashboard/products/new" />}>
            <Plus data-icon="inline-start" />
            Publicar mi primer producto
          </Button>
        </Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {productsQuery.data.map((item) => (
            <li key={item.id}>
              <Link href={`/dashboard/products/${item.id}`} className="flex flex-col gap-2">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {item.coverUrl && (
                    <img src={item.coverUrl} alt="" className="size-full object-cover" />
                  )}
                  <div className="absolute top-1 left-1 flex gap-1">
                    <Badge variant={STATUS[item.status].variant}>{STATUS[item.status].label}</Badge>
                    {item.published && <Badge>Publicado</Badge>}
                  </div>
                </div>
                <span className="line-clamp-2 text-sm font-medium">
                  {item.title ?? "Procesando…"}
                </span>
                <span className="text-sm text-muted-foreground">{formatARS(item.listPrice)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
