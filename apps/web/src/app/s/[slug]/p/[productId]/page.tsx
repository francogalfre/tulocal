import { Badge } from "@tulocal/ui/components/badge";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductChat } from "@/components/product-chat";
import { ProductGallery } from "@/components/product-gallery";
import { getAppUrl } from "@/lib/app-url";
import { formatARS } from "@/lib/format";
import { serverTrpc } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string; productId: string }> };

async function load(productId: string, slug: string) {
  try {
    const data = await serverTrpc.public.productById.query({ id: productId });
    return data.store.slug === slug ? data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, productId } = await params;
  const data = await load(productId, slug);
  if (!data) return { title: "Producto no encontrado" };
  const { product, store } = data;
  const description = `${formatARS(product.listPrice)} · ${product.description.slice(0, 140)}`;
  return {
    title: `${product.title} · ${store.name}`,
    description,
    metadataBase: new URL(getAppUrl()),
    openGraph: {
      title: product.title,
      description,
      images: product.images[0] ? [product.images[0].url] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug, productId } = await params;
  const data = await load(productId, slug);
  if (!data) notFound();
  const { product, store } = data;
  const attributes = Object.entries(product.attributes);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <nav className="text-xs text-muted-foreground">
        <Link href={`/s/${slug}`} className="underline">
          {store.name}
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{product.title}</h1>
            <p className="text-2xl">{formatARS(product.listPrice)}</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">{product.condition === "new" ? "Nuevo" : "Usado"}</Badge>
              {product.qualityPercent !== null && (
                <Badge variant="secondary">Estado {product.qualityPercent}%</Badge>
              )}
              {product.category && <Badge variant="outline">{product.category}</Badge>}
            </div>
          </div>

          {(product.marketMinPrice !== null || product.marketMaxPrice !== null) && (
            <p className="text-xs text-muted-foreground">
              Referencia de mercado: {formatARS(product.marketMinPrice)} a{" "}
              {formatARS(product.marketMaxPrice)}
            </p>
          )}

          <ProductChat productId={product.id} listPrice={product.listPrice ?? 0} />

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Descripción</h2>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {product.description}
            </p>
          </section>

          {product.conditionNotes.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Detalles de estado</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {product.conditionNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          {attributes.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Características</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {attributes.map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground capitalize">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
