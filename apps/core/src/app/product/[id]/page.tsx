import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/screen";
import { findOwnedProduct } from "@/features/product/find";
import { Gallery } from "@/features/product/gallery";
import { ProductActions } from "@/features/product/manage/actions";
import { Stages } from "@/features/product/progress/stages";
import { Qr } from "@/features/product/published/qr";
import { Share } from "@/features/product/published/share";
import { retryPipeline } from "@/features/product/retry";
import { Comparables } from "@/features/product/review/comparables";
import { ReviewForm } from "@/features/product/review/form";
import { StoreLink } from "@/features/store/link";
import type { OwnedProduct } from "@/features/product/find";
import { formatArs } from "@/lib/money";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";

const GENERATED_IMAGE_COUNT = 3;

type ProductPageProps = PageProps<"/product/[id]">;

type ProductViewProps = {
  product: OwnedProduct;
};

function Processing({ product }: ProductViewProps) {
  const pendingSlots = product.pipelineStage === "identifying" ? 0 : GENERATED_IMAGE_COUNT;

  return (
    <>
      <Gallery images={product.images} pendingSlots={pendingSlots} />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Armando la publicación</h1>
          <p className="text-muted-foreground">Tarda menos de un minuto. Podés quedarte acá.</p>
        </div>
        <Stages currentStage={product.pipelineStage} />
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
      <Gallery images={product.images} />
      <ReviewForm product={product} mode="publish" />
      <Comparables comparables={product.comparables} />
    </>
  );
}

function Celebration({ product }: ProductViewProps) {
  const storeUrl = buildStoreUrl(product.store.handle);

  return (
    <>
      <div className="flex flex-col gap-3">
        <Badge className="motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-300">
          Publicado
        </Badge>
        <h1 className="text-3xl">Listo, ya está publicado</h1>
        <p className="text-muted-foreground">
          Compartí el link o imprimí el QR. Cuando alguien quiera comprar, te avisamos por WhatsApp.
        </p>
      </div>
      <Qr url={storeUrl} handle={product.store.handle} />
      <Share url={storeUrl} />
      <div className="flex flex-col gap-1">
        <Button
          size="xl"
          variant="ghost"
          render={<Link href={`/${product.store.handle}`} />}
          nativeButton={false}
        >
          Ver mi tienda
          <ArrowUpRight data-icon="inline-end" />
        </Button>
        <Button size="xl" variant="ghost" render={<Link href="/new" />} nativeButton={false}>
          Subir otro producto
        </Button>
      </div>
    </>
  );
}

function Managed({ product }: ProductViewProps) {
  const isSold = product.status === "sold";
  const productUrl = `${buildStoreUrl(product.store.handle)}/${product.id}`;

  return (
    <>
      <Gallery images={product.images} />
      <div className="flex flex-col gap-3">
        <Badge variant={isSold ? "outline" : "default"}>{isSold ? "Vendido" : "Publicado"}</Badge>
        <p className="numeric font-heading text-5xl font-semibold text-brand-deep">
          {formatArs(product.listPriceInArs ?? 0)}
        </p>
        <h1 className="text-2xl">{product.title}</h1>
        <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
        {product.floorPriceInArs !== null ? (
          <p className="text-sm text-muted-foreground">
            Mínimo secreto:{" "}
            <span className="numeric font-medium text-foreground">
              {formatArs(product.floorPriceInArs)}
            </span>
          </p>
        ) : null}
      </div>
      <ProductActions productId={product.id} isSold={isSold} />
      {isSold ? null : <Share url={productUrl} />}
    </>
  );
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
      {product.status === "processing" ? <Processing product={product} /> : null}
      {product.status === "failed" ? <Failed product={product} /> : null}
      {product.status === "review" ? <Review product={product} /> : null}
      {isCelebrating ? <Celebration product={product} /> : null}
      {isManaged ? <Managed product={product} /> : null}
    </Screen>
  );
}
