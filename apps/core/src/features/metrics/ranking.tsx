import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ProductPerformance } from "@/features/metrics/products";

type RankingProps = {
  products: ProductPerformance[];
};

function describeCount(total: number, singular: string, plural: string): string {
  return `${total} ${total === 1 ? singular : plural}`;
}

function describeActivity(product: ProductPerformance): string {
  return [
    describeCount(product.views, "visita", "visitas"),
    describeCount(product.chats, "charla", "charlas"),
    describeCount(product.seriousBuyers, "interesado", "interesados"),
  ].join(" · ");
}

export function Ranking({ products }: RankingProps) {
  return (
    <ul className="flex flex-col">
      {products.map((product) => (
        <li key={product.id} className="border-b border-border last:border-b-0">
          <Link href={`/product/${product.id}`} className="group flex items-center gap-3 py-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {product.coverUrl !== null ? (
                <Image
                  src={product.coverUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium transition-colors group-hover:text-brand-deep">
                  {product.title ?? "Publicación sin título"}
                </span>
                {product.status === "sold" ? <Badge variant="outline">Vendido</Badge> : null}
              </div>
              <span className="numeric text-sm text-muted-foreground">
                {describeActivity(product)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
