import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/amount";
import { Develop } from "@/components/motion/develop";
import { Reveal } from "@/components/motion/reveal";
import { Rise } from "@/components/motion/rise";
import { Stagger } from "@/components/motion/stagger";
import { Screen } from "@/components/screen";
import { EscalationList } from "@/features/escalation/list";
import { findOwnedProduct } from "@/features/product/find";
import { Gallery } from "@/features/product/gallery/grid";
import { ProductActions } from "@/features/product/manage/actions";
import { Preview } from "@/features/product/progress/preview";
import { Stages } from "@/features/product/progress/stages";
import { Qr } from "@/features/product/published/qr";
import { Share } from "@/features/product/published/share";
import { retryPipeline } from "@/features/product/retry";
import { Comparables } from "@/features/product/review/comparables";
import { Facts } from "@/features/product/review/facts";
import { ReviewForm } from "@/features/product/review/form";
import { Inbox } from "@/features/question/inbox";
import { StoreLink } from "@/features/store/link";
import type { OwnedProduct } from "@/features/product/find";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";

type ProductPageProps = PageProps<"/product/[id]">;

const STATUS_TITLES = {
  processing: "Armando la publicación",
  failed: "No pudimos armar la publicación",
  review: "Revisá antes de publicar",
  published: "Publicado",
  sold: "Vendido",
} as const;

type ProductViewProps = {
  product: OwnedProduct;
};

function Processing({ product }: ProductViewProps) {
  return (
    <>
      <Preview images={product.images} isIdentifying={product.pipelineStage === "identifying"} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Armando la publicación</h1>
          <p className="text-muted-foreground">
            Tarda menos de un minuto. Si te vas, seguimos igual y lo encontrás en tu tienda.
          </p>
        </div>
        <Stages product={product} />
      </div>
    </>
  );
}

function Failed({ product }: ProductViewProps) {
  return (
    <>
      <Gallery images={product.images} />
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl">No pudimos armar la publicación</h1>
        <Alert variant="destructive">
          <AlertTitle>Qué pasó</AlertTitle>
          <AlertDescription>{product.pipelineError}</AlertDescription>
        </Alert>
        <form action={retryPipeline} className="flex flex-col gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <Button type="submit" size="xl">
            Probar de nuevo
          </Button>
          <Button size="xl" variant="outline" render={<Link href="/new" />} nativeButton={false}>
            Subir otras fotos
          </Button>
        </form>
      </div>
    </>
  );
}

function Review({ product }: ProductViewProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">Revisá antes de publicar</h1>
        <p className="text-muted-foreground">
          Todo lo que ves lo podés cambiar. Nada se publica sin tu ok.
        </p>
      </div>
      <Gallery images={product.images} ownerProductId={product.id} />
      <p className="-mt-6 text-sm text-muted-foreground">
        Tocá una foto para verla grande, elegir la portada o cambiar el orden.
      </p>
      <ReviewForm product={product} mode="publish" />
      <Facts facts={product.facts} />
      <Comparables comparables={product.comparables} />
    </>
  );
}

function Celebration({ product }: ProductViewProps) {
  const storeUrl = buildStoreUrl(product.store.handle);

  return (
    <Stagger className="flex flex-col gap-10">
      <Rise className="flex flex-col gap-3">
        <Rise className="w-fit">
          <Badge>Publicado</Badge>
        </Rise>
        <Rise>
          <h1 className="text-3xl">Listo, ya está publicado</h1>
        </Rise>
        <Rise>
          <p className="text-muted-foreground">
            Compartí el link o imprimí el QR. Cuando alguien quiera comprar, te avisamos por
            WhatsApp.
          </p>
        </Rise>
      </Rise>
      <Develop>
        <Qr url={storeUrl} handle={product.store.handle} />
      </Develop>
      <Rise>
        <Share url={storeUrl} />
      </Rise>
      <Rise className="flex flex-col gap-1">
        <Button
          size="xl"
          variant="ghost"
          render={<Link href={`/${product.store.handle}`} />}
          nativeButton={false}
        >
          Ver mi local
          <ArrowUpRight data-icon="inline-end" />
        </Button>
        <Button size="xl" variant="ghost" render={<Link href="/new" />} nativeButton={false}>
          Subir otro producto
        </Button>
      </Rise>
    </Stagger>
  );
}

function Managed({ product }: ProductViewProps) {
  const isSold = product.status === "sold";
  const productUrl = `${buildStoreUrl(product.store.handle)}/${product.id}`;

  return (
    <>
      <Gallery images={product.images} ownerProductId={product.id} />
      <div className="flex flex-col gap-3">
        <Badge variant={isSold ? "outline" : "default"}>{isSold ? "Vendido" : "Publicado"}</Badge>
        <Amount
          amountInArs={product.listPriceInArs ?? 0}
          className="font-heading text-5xl font-semibold text-brand-deep"
        />
        {product.floorPriceInArs !== null ? (
          <p className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Mínimo, solo lo ves vos</span>
            <Amount
              amountInArs={product.floorPriceInArs}
              className="font-heading text-2xl font-semibold text-warning"
            />
          </p>
        ) : null}
        <h1 className="text-2xl">{product.title}</h1>
        <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
      </div>
      <ProductActions productId={product.id} isSold={isSold} />
      {isSold ? null : <Share url={productUrl} />}
      <Inbox productId={product.id} questions={product.questions} />
      <EscalationList escalations={product.escalations} />
    </>
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const session = await requireCurrentSession();
  const { id } = await params;
  const product = await findOwnedProduct(id, session.user.id);

  if (product === null) {
    return { title: "Producto no encontrado", robots: { index: false } };
  }

  const statusTitle = STATUS_TITLES[product.status];
  const title = product.title === null ? statusTitle : `${statusTitle}: ${product.title}`;

  return { title, robots: { index: false } };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const session = await requireCurrentSession();

  const { id } = await params;
  const { celebrate } = await searchParams;

  const product = await findOwnedProduct(id, session.user.id);

  if (product === null) {
    notFound();
  }

  const isCelebrating = product.status === "published" && celebrate === "1";
  const isManaged = (product.status === "published" || product.status === "sold") && !isCelebrating;

  return (
    <Screen aside={<StoreLink handle={product.store.handle} />}>
      {product.status === "processing" ? (
        <Reveal key="processing" className="flex flex-col gap-10">
          <Processing product={product} />
        </Reveal>
      ) : null}
      {product.status === "failed" ? (
        <Reveal key="failed" className="flex flex-col gap-10">
          <Failed product={product} />
        </Reveal>
      ) : null}
      {product.status === "review" ? (
        <Reveal key="review" className="flex flex-col gap-10">
          <Review product={product} />
        </Reveal>
      ) : null}
      {isCelebrating ? <Celebration product={product} /> : null}
      {isManaged ? (
        <Reveal key="managed" className="flex flex-col gap-10">
          <Managed product={product} />
        </Reveal>
      ) : null}
    </Screen>
  );
}
