import Link from "next/link";

import { tulocalIcons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { AdminStore } from "@/features/admin/stores";

type AdminStoreCardProps = {
  store: AdminStore;
};

export function AdminStoreCard({ store }: AdminStoreCardProps) {
  return (
    <Link
      href={`/admin/stores/${store.id}`}
      className="group flex h-full flex-col gap-5 rounded-2xl border border-border p-6 outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-center gap-3">
        <Avatar size="lg" className="size-12">
          {store.avatarUrl !== null ? <AvatarImage src={store.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-brand-deep font-heading text-xl font-semibold text-white">
            {store.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-lg font-medium">{store.name}</h2>
          <p className="truncate text-sm text-muted-foreground">tulocal/{store.handle}</p>
        </div>
      </div>
      {store.description !== null ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <tulocalIcons.chart className="size-4" aria-hidden="true" />
            <span className="numeric">
              {store.visitCount} {store.visitCount === 1 ? "visita" : "visitas"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <tulocalIcons.store className="size-4" aria-hidden="true" />
            <span className="numeric">
              {store.productCount} {store.productCount === 1 ? "producto" : "productos"}
            </span>
          </span>
        </div>
        {store.suspendedAt !== null ? <Badge variant="destructive">Suspendida</Badge> : null}
      </div>
    </Link>
  );
}
