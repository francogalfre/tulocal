import Image from "next/image";
import Link from "next/link";

import { Rise } from "@/components/motion/rise";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { tulocalIcons } from "@/components/icons";
import type { DirectoryStore } from "@/features/directory/listing";
import { Verified } from "@/features/plan/access/verified";

const ABOVE_THE_FOLD_STORES = 4;

type StoreCardProps = {
  store: DirectoryStore;
  position: number;
};

function describeProductCount(productCount: number): string {
  return productCount === 1 ? "1 producto" : `${productCount} productos`;
}

export function StoreCard({ store, position }: StoreCardProps) {
  return (
    <Rise as="li" className="group">
      <Link
        href={`/${store.handle}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background outline-none transition-colors hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-[3/1] overflow-hidden bg-secondary">
          {store.bannerUrl !== null ? (
            <Image
              src={store.bannerUrl}
              alt=""
              fill
              priority={position < ABOVE_THE_FOLD_STORES}
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
          <Avatar className="-mt-7 size-14 border-4 border-background">
            {store.avatarUrl !== null ? <AvatarImage src={store.avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-brand-deep font-heading text-lg font-semibold text-white">
              {store.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-1.5 font-heading text-lg leading-snug font-semibold">
              {store.name}
              {store.verifiedPlanName !== null ? (
                <Verified planName={store.verifiedPlanName} className="size-4" />
              ) : null}
            </h3>
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span className="numeric">{describeProductCount(store.products.length)}</span>
              {store.locationName !== null ? (
                <span className="flex items-center gap-1">
                  <tulocalIcons.mapPin className="size-3.5" aria-hidden="true" />
                  {store.locationName}
                </span>
              ) : null}
            </p>
          </div>
          {store.description !== null ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
          ) : null}
        </div>
      </Link>
    </Rise>
  );
}
