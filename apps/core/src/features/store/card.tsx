"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Amount } from "@/components/amount";
import { CONDITION_LABELS } from "@/features/product/condition";
import { ProductShare } from "@/features/product/share";
import type { CatalogProduct } from "@/features/store/catalog";
import {
  EASE_OUT_EXPO,
  ENTRANCE_DURATION_IN_SECONDS,
  MAX_STAGGER_STEPS,
  STAGGER_STEP_IN_SECONDS,
  STATE_DURATION_IN_SECONDS,
} from "@/lib/motion/timing";

const STATUS_LABELS = {
  processing: { label: "Procesando", variant: "secondary" },
  review: { label: "En revisión", variant: "secondary" },
  failed: { label: "Con error", variant: "destructive" },
  published: { label: "Publicado", variant: "default" },
  sold: { label: "Vendido", variant: "outline" },
} as const;

const CARD_START_OFFSET_IN_PIXELS = 16;
const CARD_EXIT_SCALE = 0.96;
const ABOVE_THE_FOLD_CARDS = 4;

type ProductCardProps = {
  product: CatalogProduct;
  href: string;
  shareUrl: string | null;
  showStatus: boolean;
  position: number;
};

function computeEntranceDelayInSeconds(position: number): number {
  return Math.min(position, MAX_STAGGER_STEPS) * STAGGER_STEP_IN_SECONDS;
}

export function ProductCard({ product, href, shareUrl, showStatus, position }: ProductCardProps) {
  const status = STATUS_LABELS[product.status];

  return (
    <motion.li
      layout="position"
      className="group relative"
      initial={{ opacity: 0, y: CARD_START_OFFSET_IN_PIXELS }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: ENTRANCE_DURATION_IN_SECONDS,
          ease: EASE_OUT_EXPO,
          delay: computeEntranceDelayInSeconds(position),
        },
      }}
      viewport={{ once: true, amount: 0.15 }}
      exit={{
        opacity: 0,
        scale: CARD_EXIT_SCALE,
        transition: { duration: STATE_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO },
      }}
    >
      <Link
        href={href}
        className="flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
          {product.coverUrl !== null ? (
            <Image
              src={product.coverUrl}
              alt={product.title ?? ""}
              fill
              priority={position < ABOVE_THE_FOLD_CARDS}
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
      {shareUrl !== null ? <ProductShare url={shareUrl} title={product.title} /> : null}
    </motion.li>
  );
}
