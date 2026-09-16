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
      <Badge>tienda creada</Badge>
      <h1 className="text-3xl">ya tenés tu tienda</h1>
      <a href={storeUrl} className="font-heading text-xl font-semibold text-primary">
        tulocal/{store.handle}
      </a>
    </div>
  );
}
