import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Amount } from "@/components/amount";
import { CONDITION_LABELS } from "@/features/product/condition";
import type { CatalogProduct } from "@/features/store/catalog";

const STATUS_LABELS = {
  processing: { label: "Procesando", variant: "secondary" },
  review: { label: "En revisión", variant: "secondary" },
  failed: { label: "Con error", variant: "destructive" },
  published: { label: "Publicado", variant: "default" },
  sold: { label: "Vendido", variant: "outline" },
} as const;

type ProductCardProps = {
  product: CatalogProduct;
  href: string;
  showStatus: boolean;
};

export function ProductCard({ product, href, showStatus }: ProductCardProps) {
  const status = STATUS_LABELS[product.status];

  return (
    <li>
      <Link
        href={href}
        className="group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
          {product.coverUrl !== null ? (
            <Image
              src={product.coverUrl}
              alt={product.title ?? ""}
              fill
              sizes="(max-width: 640px) 50vw, 320px"
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
        <div className="flex flex-col gap-1.5 px-1">
          <h2 className="line-clamp-2 text-base leading-snug font-medium">
            {product.title ?? "Sin título todavía"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {product.condition !== null ? <span>{CONDITION_LABELS[product.condition]}</span> : null}
            {showStatus ? <Badge variant={status.variant}>{status.label}</Badge> : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
