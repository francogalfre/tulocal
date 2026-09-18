import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/amount";
import { tulocalIcons } from "@/components/icons";
import { Logo } from "@/components/logo";
import { InView } from "@/components/motion/inview";
import { Launcher } from "@/features/chat/launcher";
import { truncateForPreview } from "@/features/opengraph/truncate";
import { Chat } from "@/features/chat/panel";
import { resumeConversation } from "@/features/conversation/resume";
import { recordProductVisit } from "@/features/metrics/record";
import { findCurrentPlan } from "@/features/plan/access/current";
import { Verified } from "@/features/plan/access/verified";
import { isAgentMessageLimitReached } from "@/features/plan/limits/usage";
import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import { Gallery } from "@/features/product/gallery/grid";
import { findPublicProduct } from "@/features/product/public";
import type { PublicProduct } from "@/features/product/public";
import { formatArs } from "@/lib/money";
import { findCurrentSession } from "@/lib/session";

type PublicProductPageProps = PageProps<"/[handle]/[productId]">;

const DESCRIPTION_MAX_CHARACTERS = 160;

function describeProduct(product: PublicProduct): string {
  const price = formatArs(product.listPriceInArs ?? 0);

  if (product.description === null || product.description.length === 0) {
    return `${price}. Lo vende ${product.store.name} en tulocal.`;
  }

  const singleLineDescription = product.description.replace(/\s+/g, " ").trim();

  return truncateForPreview(`${price}. ${singleLineDescription}`, DESCRIPTION_MAX_CHARACTERS);
}

export async function generateMetadata({ params }: PublicProductPageProps): Promise<Metadata> {
  const { handle, productId } = await params;
  const product = await findPublicProduct(handle, productId);

  if (product === null) {
    return { title: "Producto no encontrado" };
  }

  const title = product.title ?? "Producto";
  const description = describeProduct(product);
  const path = `/${product.store.handle}/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { handle, productId } = await params;
  const [product, conversation, session] = await Promise.all([
    findPublicProduct(handle, productId),
    resumeConversation(productId),
    findCurrentSession(),
  ]);

  if (product === null) {
    notFound();
  }

  const title = product.title ?? "Producto";
  const [isAgentLimitReached, { details: storePlan }] = await Promise.all([
    isAgentMessageLimitReached(product.store.id),
    findCurrentPlan(product.store.id),
  ]);

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
          <tulocalIcons.arrowLeft data-icon="inline-start" />
          {product.store.name}
          {storePlan.isVerified ? <Verified planName={storePlan.name} className="size-4" /> : null}
        </Button>
      </header>
      <InView>
        <Gallery images={product.images} />
      </InView>
      <InView className="flex flex-col gap-3">
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
      </InView>
      <Launcher
        agentName={product.store.agentName}
        agentSeed={product.store.agentSeed}
        agentVoice={product.store.agentVoice}
        hasHistory={conversation.messages.length > 0}
      >
        <Chat
          productId={product.id}
          productTitle={title}
          listPriceInArs={product.listPriceInArs ?? 0}
          agentName={product.store.agentName}
          agentSeed={product.store.agentSeed}
          agentVoice={product.store.agentVoice}
          whatsappPhone={product.store.whatsappPhone}
          initialMessages={conversation.messages}
          initialClosing={conversation.closing}
          isAgentAvailable={!isAgentLimitReached}
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
          <tulocalIcons.arrowUpRight data-icon="inline-end" />
        </Button>
      </Launcher>
    </main>
  );
}
