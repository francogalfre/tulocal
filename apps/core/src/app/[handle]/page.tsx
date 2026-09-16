import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import type { Metadata } from "next";

import type { Session } from "@tulocal/authentication/server";

import { Button } from "@/components/ui/button";
import { tulocalIcons } from "@/components/icons";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/logo";
import { InView } from "@/components/motion/inview";
import { recordStoreVisit } from "@/features/metrics/record";
import {
  arrangeCatalog,
  parseCatalogFilters,
  selectCoverUrl,
  summarizeCategories,
} from "@/features/store/catalog";
import { findOwnerCatalog } from "@/features/store/find";
import { CatalogGrid } from "@/features/store/grid";
import { StoreHeader } from "@/features/store/header";
import { readPublicPlace } from "@/features/store/location/place";
import { LocationSection } from "@/features/store/location/section";
import { findPublicStore } from "@/features/store/public";
import type { PublicStore } from "@/features/store/public";
import { StoreShare } from "@/features/store/share";
import { CatalogToolbar } from "@/features/store/toolbar";
import type { CatalogProduct } from "@/features/store/catalog";
import type { StoreProfile } from "@/features/store/header";
import type { PublicPlaceColumns } from "@/features/store/location/place";
import { findCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";

type StorePageProps = PageProps<"/[handle]">;

type StoreView = {
  store: StoreProfile & PublicPlaceColumns & { id: string };
  products: CatalogProduct[];
  isOwner: boolean;
};

type StoreViewInput = {
  handle: string;
  session: Session | null;
  publicStore: PublicStore | null;
};

async function loadOwnerView(handle: string, ownerId: string): Promise<StoreView | null> {
  const catalog = await findOwnerCatalog(ownerId);

  if (catalog === null || catalog.handle !== handle) {
    return null;
  }

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

function buildPublicView(store: PublicStore): StoreView {
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

async function resolveStoreView(input: StoreViewInput): Promise<StoreView | null> {
  if (input.session !== null) {
    const ownerView = await loadOwnerView(input.handle, input.session.user.id);

    if (ownerView !== null) {
      return ownerView;
    }
  }

  if (input.publicStore === null) {
    return null;
  }

  return buildPublicView(input.publicStore);
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { handle } = await params;
  const store = await findPublicStore(handle);

  if (store === null) {
    return { title: "Tienda no encontrada" };
  }

  const description =
    store.description === null || store.description.length === 0
      ? `Lo que vende ${store.name}, en un solo link. Preguntá y negociá con ${store.agentName}.`
      : store.description;

  return {
    title: store.name,
    description,
    alternates: { canonical: `/${store.handle}` },
    openGraph: { title: store.name, description, url: `/${store.handle}` },
  };
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { handle } = await params;
  const filters = parseCatalogFilters(await searchParams);
  const [session, publicStore] = await Promise.all([findCurrentSession(), findPublicStore(handle)]);
  const view = await resolveStoreView({ handle, session, publicStore });

  if (view === null) {
    notFound();
  }

  const { store, products, isOwner } = view;

  if (!isOwner) {
    after(() => recordStoreVisit(store.id));
  }

  const arranged = arrangeCatalog(products, filters);
  const categories = summarizeCategories(products);
  const storeUrl = buildStoreUrl(store.handle);
  const place = readPublicPlace(store);

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
                <tulocalIcons.plus />
              </Button>
              <Button
                size="lg"
                className="hidden sm:inline-flex"
                render={<Link href="/new" />}
                nativeButton={false}
              >
                <tulocalIcons.plus data-icon="inline-start" />
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
      <InView>
        <StoreHeader
          store={store}
          productCount={products.length}
          actions={
            isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label="Ver métricas"
                  render={<Link href="/metrics" />}
                  nativeButton={false}
                >
                  <tulocalIcons.chart />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/store/edit" />}
                  nativeButton={false}
                >
                  <tulocalIcons.settings data-icon="inline-start" />
                  Editar tienda
                </Button>
              </>
            ) : undefined
          }
        />
      </InView>
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
          <InView>
            <CatalogToolbar filters={filters} categories={categories} showStatus={isOwner} />
          </InView>
          {arranged.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nada con esos filtros</EmptyTitle>
                <EmptyDescription>Probá con otro estado u orden.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <CatalogGrid products={arranged} handle={store.handle} isOwner={isOwner} />
          )}
        </div>
      )}
      {place !== null ? (
        <InView>
          <LocationSection place={place} />
        </InView>
      ) : null}
    </main>
  );
}
