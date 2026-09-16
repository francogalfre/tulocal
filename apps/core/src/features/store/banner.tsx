import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buildStoreUrl } from "@/lib/url";
import type { Store } from "@/features/store/find";

type StoreBannerProps = {
  store: Store;
};

export function StoreBanner({ store }: StoreBannerProps) {
  const storeUrl = buildStoreUrl(store.handle);

  return (
    <div className="flex flex-col gap-3">
      <Badge>Tienda creada</Badge>
      <h1 className="text-3xl">Ya tenés tu tienda</h1>
      <a
        href={storeUrl}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex w-fit items-center gap-1 rounded-md font-heading text-xl font-semibold text-brand-deep underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        tulocal/{store.handle}
        <ArrowUpRight
          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </a>
      <p className="text-muted-foreground">Subí la primera foto y la publicación se arma sola.</p>
    </div>
  );
}
