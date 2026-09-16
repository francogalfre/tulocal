import Image from "next/image";
import { notFound } from "next/navigation";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/logo";
import { findPublicStore } from "@/features/store/public";
import type { PublicStore } from "@/features/store/public";
import { formatArs } from "@/lib/money";

type StorePageProps = PageProps<"/[handle]">;

type PublicProduct = PublicStore["products"][number];

function selectCoverImage(product: PublicProduct) {
  return product.images.find((image) => image.kind === "primary") ?? product.images[0] ?? null;
}

function ProductCard({ product }: { product: PublicProduct }) {
  const cover = selectCoverImage(product);

  return (
    <li className="flex flex-col gap-3">
      {cover !== null ? (
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={cover.url}
            alt={product.title ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="numeric font-heading text-3xl font-semibold text-brand-deep">
          {formatArs(product.listPriceInArs ?? 0)}
        </p>
        <h2 className="text-lg">{product.title}</h2>
        <p className="line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">
          {product.description}
        </p>
      </div>
    </li>
  );
}

export default async function StorePage({ params }: StorePageProps) {
  const { handle } = await params;
  const store = await findPublicStore(handle);

  if (store === null) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 pt-6 pb-16">
      <header className="flex h-8 items-center">
        <Logo wordmark={false} href={`/${store.handle}`} />
      </header>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl">{store.name}</h1>
        <p className="text-muted-foreground">tulocal/{store.handle}</p>
      </div>
      {store.products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Todavía no hay nada publicado</EmptyTitle>
            <EmptyDescription>Volvé en un rato.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8">
          {store.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </main>
  );
}
