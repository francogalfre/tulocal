import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Gallery } from "@/features/product/gallery";
import { findPublicProduct } from "@/features/product/public";
import { formatArs } from "@/lib/money";

type PublicProductPageProps = PageProps<"/[handle]/[productId]">;

const CONDITION_LABELS = {
  new: "Nuevo",
  used: "Usado",
};

function buildWhatsappUrl(phone: string, title: string): string {
  const message = `Hola, vi "${title}" en tu tienda de tulocal y me interesa.`;

  return `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { handle, productId } = await params;
  const product = await findPublicProduct(handle, productId);

  if (product === null) {
    notFound();
  }

  const title = product.title ?? "Producto";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 pt-6 pb-16">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/${product.store.handle}`} />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          {product.store.name}
        </Button>
      </header>
      <Gallery images={product.images} />
      <div className="flex flex-col gap-3">
        <p className="numeric font-heading text-5xl font-semibold text-brand-deep">
          {formatArs(product.listPriceInArs ?? 0)}
        </p>
        <h1 className="text-2xl">{title}</h1>
        {product.condition !== null ? (
          <Badge variant="outline">{CONDITION_LABELS[product.condition]}</Badge>
        ) : null}
        <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
      </div>
      {product.store.whatsappPhone !== null ? (
        <Button
          size="xl"
          render={
            <a
              href={buildWhatsappUrl(product.store.whatsappPhone, title)}
              target="_blank"
              rel="noreferrer"
            />
          }
          nativeButton={false}
        >
          <MessageCircle data-icon="inline-start" />
          Hablar con el dueño
        </Button>
      ) : null}
    </main>
  );
}
