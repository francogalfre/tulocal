import { Badge } from "@tulocal/ui/components/badge";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatARS } from "@/lib/format";
import { serverTrpc } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await serverTrpc.public.storeBySlug.query({ slug });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Tienda no encontrada" };
  return {
    title: data.store.name,
    description: data.store.description ?? `Productos de ${data.store.name} en tulocal`,
    openGraph: {
      title: data.store.name,
      description: data.store.description ?? undefined,
      images: data.products
        .map((p) => p.coverUrl)
        .filter((url): url is string => !!url)
        .slice(0, 1),
    },
  };
}

export default async function StorePage({ params }: Params) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Tienda en tulocal</p>
        <h1 className="text-3xl font-semibold tracking-tight">{data.store.name}</h1>
        {data.store.description && (
          <p className="text-sm text-muted-foreground">{data.store.description}</p>
        )}
      </header>

      {data.products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay productos publicados.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {data.products.map((item) => (
            <li key={item.id}>
              <Link href={`/s/${slug}/p/${item.id}`} className="group flex flex-col gap-2">
                <div className="aspect-square overflow-hidden bg-muted">
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="line-clamp-2 text-sm font-medium">{item.title}</span>
                  <span className="text-sm">{formatARS(item.listPrice)}</span>
                  <div className="flex gap-1">
                    <Badge variant="outline">{item.condition === "new" ? "Nuevo" : "Usado"}</Badge>
                    {item.qualityPercent !== null && (
                      <Badge variant="secondary">Estado {item.qualityPercent}%</Badge>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <footer className="mt-auto border-t pt-4 text-xs text-muted-foreground">
        Hecho con{" "}
        <Link href="/" className="underline">
          tulocal
        </Link>
      </footer>
    </main>
  );
}
