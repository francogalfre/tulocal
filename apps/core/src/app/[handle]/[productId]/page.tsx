import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/amount";
import { Logo } from "@/components/logo";
import { Launcher } from "@/features/chat/launcher";
import { Chat } from "@/features/chat/panel";
import { resumeConversation } from "@/features/conversation/resume";
import { recordProductVisit } from "@/features/metrics/record";
import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import { Gallery } from "@/features/product/gallery/grid";
import { findPublicProduct } from "@/features/product/public";
import { findCurrentSession } from "@/lib/session";

type PublicProductPageProps = PageProps<"/[handle]/[productId]">;

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { handle, productId } = await params;
  const [product, session] = await Promise.all([
    findPublicProduct(handle, productId),
    findCurrentSession(),
  ]);

  if (product === null) {
    notFound();
  }

  const title = product.title ?? "Producto";
  const conversation = await resumeConversation(product.id);

  if (session?.user.id !== product.store.ownerId) {
    after(() => recordProductVisit(product.store.id, product.id));
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 pt-6 pb-16">
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
        <Amount
          amountInArs={product.listPriceInArs ?? 0}
          className="font-heading text-5xl font-semibold text-brand-deep"
        />
        <h1 className="text-2xl">{title}</h1>
        <div className="flex items-center gap-3">
          {product.condition !== null ? (
            <Badge variant="outline">{CONDITION_LABELS[product.condition]}</Badge>
          ) : null}
          {product.category !== null ? (
            <span className="text-sm text-muted-foreground">
              {CATEGORY_LABELS[product.category]}
            </span>
          ) : null}
        </div>
        <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
      </div>
      <Launcher agentName={product.store.agentName} hasHistory={conversation.messages.length > 0}>
        <Chat
          productId={product.id}
          productTitle={title}
          agentName={product.store.agentName}
          whatsappPhone={product.store.whatsappPhone}
          initialMessages={conversation.messages}
          initialClosing={conversation.closing}
          isFullHeight
        />
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 self-start"
          render={<Link href={`/${product.store.handle}/${product.id}/chat`} />}
          nativeButton={false}
        >
          Ver el chat completo
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </Launcher>
    </main>
  );
}
