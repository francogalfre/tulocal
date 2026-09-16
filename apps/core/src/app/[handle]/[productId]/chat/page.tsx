import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { tulocalIcons } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Chat } from "@/features/chat/panel";
import { resumeConversation } from "@/features/conversation/resume";
import { findPublicProduct } from "@/features/product/public";

type ChatPageProps = PageProps<"/[handle]/[productId]/chat">;

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { handle, productId } = await params;
  const product = await findPublicProduct(handle, productId);

  if (product === null) {
    return { title: "Producto no encontrado" };
  }

  const title = product.title ?? "Producto";

  return {
    title: `Chat con ${product.store.agentName}`,
    description: `Preguntá y negociá por ${title} con ${product.store.agentName}, el vendedor de ${product.store.name}.`,
    robots: { index: false },
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { handle, productId } = await params;
  const [product, conversation] = await Promise.all([
    findPublicProduct(handle, productId),
    resumeConversation(productId),
  ]);

  if (product === null) {
    notFound();
  }

  const title = product.title ?? "Producto";

  return (
    <main className="mx-auto flex h-dvh w-full max-w-2xl flex-col gap-6 px-5 pt-6 pb-6">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/${product.store.handle}/${product.id}`} />}
          nativeButton={false}
        >
          <tulocalIcons.arrowLeft data-icon="inline-start" />
          {title}
        </Button>
      </header>
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
        isFullHeight
      />
    </main>
  );
}
