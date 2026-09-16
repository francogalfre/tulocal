import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Amount } from "@/components/amount";
import { Logo } from "@/components/logo";
import { Chat } from "@/features/chat/panel";
import { resumeConversation } from "@/features/conversation/resume";
import { findPublicProduct } from "@/features/product/public";

type ChatPageProps = PageProps<"/[handle]/[productId]/chat">;

export default async function ChatPage({ params }: ChatPageProps) {
  const { handle, productId } = await params;
  const product = await findPublicProduct(handle, productId);

  if (product === null) {
    notFound();
  }

  const title = product.title ?? "Producto";
  const conversation = await resumeConversation(product.id);

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col gap-6 px-5 pt-6 pb-6">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/${product.store.handle}/${product.id}`} />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          {title}
        </Button>
      </header>
      <Amount
        amountInArs={product.listPriceInArs ?? 0}
        className="font-heading text-3xl font-semibold text-brand-deep"
      />
      <Chat
        productId={product.id}
        productTitle={title}
        agentName={product.store.agentName}
        whatsappPhone={product.store.whatsappPhone}
        initialMessages={conversation.messages}
        initialClosing={conversation.closing}
        isFullHeight
      />
    </main>
  );
}
