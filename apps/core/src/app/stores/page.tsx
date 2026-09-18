import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/logo";
import { InView } from "@/components/motion/inview";
import { Stagger } from "@/components/motion/stagger";
import { findDirectory } from "@/features/directory/listing";
import { parseDirectoryQuery, searchDirectory } from "@/features/directory/match";
import { DirectoryProductCard } from "@/features/directory/product";
import { DirectorySearch } from "@/features/directory/search";
import { StoreCard } from "@/features/directory/store";
import { GoogleSignIn } from "@/features/landing/google";
import { findCurrentSession } from "@/lib/session";

const DIRECTORY_DESCRIPTION =
  "Encontrá tiendas y productos de vendedores de Argentina. Buscá por nombre, rubro o producto y escribile al local en un toque.";

type StoresPageProps = PageProps<"/stores">;

export async function generateMetadata({ searchParams }: StoresPageProps): Promise<Metadata> {
  const query = parseDirectoryQuery((await searchParams).q);

  return {
    title: query.length > 0 ? `Resultados para ${query}` : "Tiendas",
    description: DIRECTORY_DESCRIPTION,
    alternates: { canonical: "/stores" },
    robots: query.length > 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const query = parseDirectoryQuery((await searchParams).q);
  const [session, directory] = await Promise.all([findCurrentSession(), findDirectory()]);
  const results = searchDirectory(directory, query);
  const isSearching = query.length > 0;
  const hasResults = results.stores.length > 0 || results.products.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col lg:border-x">
      <main className="flex flex-1 flex-col gap-10 px-6 pt-6 pb-24">
        <header className="flex h-9 items-center justify-between">
          <Logo />
          {session !== null ? (
            <Button size="lg" className="px-4" render={<Link href="/store" />} nativeButton={false}>
              Mi local
            </Button>
          ) : (
            <GoogleSignIn label="Vender en tulocal" variant="outline" size="lg" className="px-4" />
          )}
        </header>

        <InView className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl tracking-tight sm:text-5xl">Tiendas en tulocal</h1>
            <p className="max-w-xl text-muted-foreground">{DIRECTORY_DESCRIPTION}</p>
          </div>
          <DirectorySearch initialQuery={query} />
        </InView>

        {!hasResults ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {isSearching ? `Nada para “${query}”` : "Todavía no hay tiendas publicadas"}
              </EmptyTitle>
              <EmptyDescription>
                {isSearching ? "Probá con otra palabra o algo más general." : "Volvé en un rato."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {results.stores.length > 0 ? (
          <section className="flex flex-col gap-4">
            {isSearching ? <h2 className="text-2xl">Tiendas</h2> : null}
            <Stagger key={query} as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.stores.map((store, position) => (
                <StoreCard key={store.id} store={store} position={position} />
              ))}
            </Stagger>
          </section>
        ) : null}

        {results.products.length > 0 ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl">Productos</h2>
            <Stagger
              key={query}
              as="ul"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6"
            >
              {results.products.map((product) => (
                <DirectoryProductCard key={product.id} product={product} />
              ))}
            </Stagger>
          </section>
        ) : null}
      </main>
    </div>
  );
}
