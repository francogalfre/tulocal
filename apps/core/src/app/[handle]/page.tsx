import { Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/logo";
import { ProductCard } from "@/features/store/card";
import {
  arrangeCatalog,
  parseCatalogFilters,
  selectCoverUrl,
  summarizeCategories,
} from "@/features/store/catalog";
import { findOwnerCatalog } from "@/features/store/find";
import { StoreHeader } from "@/features/store/header";
import { findPublicStore } from "@/features/store/public";
import { StoreShare } from "@/features/store/share";
import { CatalogToolbar } from "@/features/store/toolbar";
import type { CatalogProduct } from "@/features/store/catalog";
import type { StoreProfile } from "@/features/store/header";
import { findCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";

type StorePageProps = PageProps<"/[handle]">;

type StoreView = {
  store: StoreProfile & { handle: string };
  products: CatalogProduct[];
  isOwner: boolean;
};

async function loadStoreView(handle: string, ownerId: string | null): Promise<StoreView | null> {
  if (ownerId !== null) {
    const catalog = await findOwnerCatalog(ownerId);

    if (catalog !== null && catalog.handle === handle) {
      return {
        store: catalog,
        isOwner: true,
        products: catalog.products.map((product) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          listPriceInArs: product.listPriceInArs,
          condition: product.condition,
          status: product.status,
          coverUrl: selectCoverUrl(product.images),
          createdAt: product.createdAt,
        })),
      };
    }
  }

  const store = await findPublicStore(handle);

  if (store === null) {
    return null;
  }

  return {
    store,
    isOwner: false,
    products: store.products.map((product) => ({
      id: product.id,
      title: product.title,
      category: product.category,
      listPriceInArs: product.listPriceInArs,
      condition: product.condition,
      status: product.status,
      coverUrl: selectCoverUrl(product.images),
      createdAt: product.createdAt,
    })),
  };
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { handle } = await params;
  const filters = parseCatalogFilters(await searchParams);
  const session = await findCurrentSession();
  const view = await loadStoreView(handle, session?.user.id ?? null);

  if (view === null) {
    notFound();
  }

  const { store, products, isOwner } = view;
  const arranged = arrangeCatalog(products, filters);
  const categories = summarizeCategories(products);
  const storeUrl = buildStoreUrl(store.handle);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 pt-6 pb-16">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <StoreShare url={storeUrl} title={store.name} isOwner={isOwner} />
          {isOwner ? (
            <>
              <Button
                size="icon-lg"
                className="sm:hidden"
                aria-label="Agregar producto"
                render={<Link href="/new" />}
                nativeButton={false}
              >
                <Plus />
              </Button>
              <Button
                size="lg"
                className="hidden sm:inline-flex"
                render={<Link href="/new" />}
                nativeButton={false}
              >
                <Plus data-icon="inline-start" />
                Agregar producto
              </Button>
            </>
          ) : null}
          {session === null ? (
            <Button variant="ghost" size="lg" render={<Link href="/" />} nativeButton={false}>
              Ingresar
            </Button>
          ) : null}
        </div>
      </header>
      <StoreHeader
        store={store}
        productCount={products.length}
        actions={
          isOwner ? (
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/store/edit" />}
              nativeButton={false}
            >
              <Settings2 data-icon="inline-start" />
              Editar tienda
            </Button>
          ) : undefined
        }
      />
      {products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {isOwner ? "Todavía no subiste nada" : "Todavía no hay nada publicado"}
            </EmptyTitle>
            <EmptyDescription>
              {isOwner ? "Sacá una foto y la publicación se arma sola." : "Volvé en un rato."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          <CatalogToolbar filters={filters} categories={categories} showStatus={isOwner} />
          {arranged.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nada con esos filtros</EmptyTitle>
                <EmptyDescription>Probá con otro estado u orden.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
              {arranged.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={isOwner ? `/product/${product.id}` : `/${store.handle}/${product.id}`}
                  showStatus={isOwner}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
