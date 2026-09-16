import Image from "next/image";
import { notFound } from "next/navigation";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/logo";
import { findPublicStore } from "@/features/store/public";
import type { PublicStore } from "@/features/store/public";
import { formatArs } from "@/lib/money";

type StorePageProps = PageProps<"/[handle]">;

function selectCoverImage(product: PublicStore["products"][number]) {
  return product.images.find((image) => image.kind === "primary") ?? product.images[0] ?? null;
}

export default async function StorePage({ params }: StorePageProps) {
  const { handle } = await params;
  const store = await findPublicStore(handle);

  if (store === null) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-8">
      <Logo wordmark={false} />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">{store.name}</h1>
        <p className="text-muted-foreground">tulocal/{store.handle}</p>
      </div>
      {store.products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>todavía no hay nada publicado</EmptyTitle>
            <EmptyDescription>volvé en un rato.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-8">
          {store.products.map((product) => {
            const cover = selectCoverImage(product);

            return (
              <li key={product.id} className="flex flex-col gap-3">
                {cover !== null ? (
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={cover.url}
                      alt={product.title ?? ""}
                      fill
                      sizes="448px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <p className="font-heading text-4xl font-semibold text-primary">
                  {formatArs(product.listPriceInArs ?? 0)}
                </p>
                <h2 className="text-xl">{product.title}</h2>
                <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
