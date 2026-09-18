import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { tulocalIcons } from "@/components/icons";
import { InView } from "@/components/motion/inview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { AdminManage } from "@/features/admin/manage";
import { AdminMetric } from "@/features/admin/metric";
import { findAdminStoreDetail } from "@/features/admin/store";
import { findCurrentPlan } from "@/features/plan/access/current";
import { formatArs } from "@/lib/money";
import { formatDate } from "@/lib/time";

const numberFormatter = new Intl.NumberFormat("es-AR");

const PRODUCT_STATUS = {
  processing: { label: "Procesando", variant: "secondary" },
  review: { label: "En revisión", variant: "secondary" },
  failed: { label: "Con error", variant: "destructive" },
  published: { label: "Publicado", variant: "default" },
  sold: { label: "Vendido", variant: "outline" },
} as const;

type AdminStorePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminStorePage({ params }: AdminStorePageProps) {
  const { id } = await params;
  const store = await findAdminStoreDetail(id);

  if (store === null) {
    notFound();
  }

  const currentPlan = await findCurrentPlan(store.id);
  const isSuspended = store.suspendedAt !== null;

  return (
    <div className="flex flex-col gap-12">
      <InView className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link href="/admin" />}
          nativeButton={false}
        >
          <tulocalIcons.arrowLeft data-icon="inline-start" />
          Volver
        </Button>
        <section className="flex flex-col gap-6 rounded-2xl border border-border p-8">
          <div className="flex items-start gap-5">
            <Avatar className="size-16">
              {store.avatarUrl !== null ? <AvatarImage src={store.avatarUrl} alt="" /> : null}
              <AvatarFallback className="bg-brand-deep font-heading text-2xl font-semibold text-white">
                {store.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl">{store.name}</h1>
                <Badge>{currentPlan.details.name}</Badge>
                {isSuspended ? <Badge variant="destructive">Suspendida</Badge> : null}
              </div>
              <Link
                href={`/${store.handle}`}
                className="w-fit text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                tulocal/{store.handle}
              </Link>
            </div>
          </div>
          {store.description !== null ? (
            <p className="whitespace-pre-line text-sm">{store.description}</p>
          ) : null}
          <dl className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt>Dueño:</dt>
              <dd className="text-foreground">{store.ownerEmail}</dd>
            </div>
            {store.locationName !== null ? (
              <div className="flex gap-2">
                <dt>Ubicación:</dt>
                <dd className="text-foreground">{store.locationName}</dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt>Creada:</dt>
              <dd className="text-foreground">{formatDate(store.createdAt)}</dd>
            </div>
          </dl>
          <AdminManage
            storeId={store.id}
            name={store.name}
            description={store.description ?? ""}
            isSuspended={isSuspended}
            isPaid={currentPlan.plan !== "free"}
          />
        </section>
      </InView>

      <InView className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminMetric label="Visitas" value={numberFormatter.format(store.visitCount)} />
        <AdminMetric label="Productos" value={numberFormatter.format(store.productCount)} />
        <AdminMetric label="Publicados" value={numberFormatter.format(store.publishedCount)} />
        <AdminMetric label="Vendidos" value={numberFormatter.format(store.soldCount)} />
      </InView>

      <InView as="section" className="flex flex-col gap-4">
        <h2 className="text-xl">Productos</h2>
        {store.products.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Sin productos</EmptyTitle>
              <EmptyDescription>Esta tienda todavía no subió nada.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {store.products.map((product) => {
              const status = PRODUCT_STATUS[product.status];

              return (
                <li
                  key={product.id}
                  className="flex items-center gap-4 rounded-xl border border-border p-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {product.coverUrl !== null ? (
                      <Image
                        src={product.coverUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-sm font-medium">{product.title ?? "Sin título"}</p>
                    {product.listPriceInArs !== null ? (
                      <p className="text-sm text-muted-foreground">
                        {formatArs(product.listPriceInArs)}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </InView>
    </div>
  );
}
