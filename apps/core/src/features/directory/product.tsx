import Image from "next/image";
import Link from "next/link";

import { Rise } from "@/components/motion/rise";
import { Amount } from "@/components/amount";
import type { DirectoryProduct } from "@/features/directory/listing";

type DirectoryProductCardProps = {
  product: DirectoryProduct;
};

export function DirectoryProductCard({ product }: DirectoryProductCardProps) {
  return (
    <Rise as="li" className="group">
      <Link
        href={`/${product.storeHandle}/${product.id}`}
        className="flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
          {product.coverUrl !== null ? (
            <Image
              src={product.coverUrl}
              alt={product.title ?? ""}
              fill
              sizes="(max-width: 640px) 50vw, 280px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
          {product.listPriceInArs !== null ? (
            <Amount
              amountInArs={product.listPriceInArs}
              className="absolute top-3 left-3 rounded-lg border border-border bg-background px-2.5 py-1 font-heading text-sm font-semibold"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-1 px-1">
          <h3 className="line-clamp-2 text-base leading-snug font-medium">
            {product.title ?? "Sin título"}
          </h3>
          <p className="truncate text-sm text-muted-foreground">{product.storeName}</p>
        </div>
      </Link>
    </Rise>
  );
}
