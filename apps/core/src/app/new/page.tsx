import type { Metadata } from "next";

import { tulocalIcons } from "@/components/icons";
import { Reveal } from "@/components/motion/reveal";
import { Screen } from "@/components/screen";
import { Dropzone } from "@/features/product/upload/dropzone";
import { ensureStore } from "@/features/store/ensure";
import { findStoreEntry } from "@/features/store/find";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Subí un producto",
  robots: { index: false },
};

type IntroProps = {
  handle: string;
  isFirstProduct: boolean;
};

function Intro({ handle, isFirstProduct }: IntroProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl">¿Qué vendés?</h1>
      {isFirstProduct ? (
        <p className="text-muted-foreground">
          Tu tienda ya está en{" "}
          <a
            href={buildStoreUrl(handle)}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-0.5 rounded-sm font-medium text-brand-deep underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            tulocal/{handle}
            <tulocalIcons.arrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
          . Sacale fotos a algo que quieras vender y la publicación se arma sola.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Sacale fotos y la publicación se arma sola: título, precio y fotos mejoradas.
        </p>
      )}
    </div>
  );
}

export default async function NewProductPage() {
  const session = await requireCurrentSession();
  const store = await ensureStore(session.user);
  const entry = await findStoreEntry(session.user.id);
  const isFirstProduct = entry === null || !entry.hasProducts;

  return (
    <Screen aside={<StoreLink handle={store.handle} />}>
      <Reveal className="flex flex-col gap-8">
        <Intro handle={store.handle} isFirstProduct={isFirstProduct} />
        <Dropzone />
      </Reveal>
    </Screen>
  );
}
