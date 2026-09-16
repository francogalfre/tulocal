import Image from "next/image";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type StoreProfile = {
  name: string;
  handle: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

type StoreHeaderProps = {
  store: StoreProfile;
  productCount: number;
  actions?: ReactNode;
};

function describeProductCount(productCount: number): string {
  if (productCount === 1) {
    return "1 producto";
  }

  return `${productCount} productos`;
}

export function StoreHeader({ store, productCount, actions }: StoreHeaderProps) {
  return (
    <section className="flex flex-col">
      <div className="relative -mx-5 aspect-[3/1] overflow-hidden bg-secondary sm:mx-0 sm:rounded-2xl">
        {store.bannerUrl !== null ? (
          <Image
            src={store.bannerUrl}
            alt=""
            fill
            sizes="672px"
            priority
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="-mt-10 flex items-end justify-between gap-4">
        <Avatar className="size-20 border-4 border-background">
          {store.avatarUrl !== null ? <AvatarImage src={store.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-brand-deep font-heading text-2xl font-semibold text-white">
            {store.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {actions !== undefined ? <div className="flex gap-2 pb-1">{actions}</div> : null}
      </div>
      <div className="flex flex-col gap-1.5 pt-3">
        <h1 className="text-3xl">{store.name}</h1>
        <p className="text-sm text-muted-foreground">
          tulocal/{store.handle} · {describeProductCount(productCount)}
        </p>
        {store.description !== null ? (
          <p className="max-w-prose whitespace-pre-line pt-1">{store.description}</p>
        ) : null}
      </div>
    </section>
  );
}
