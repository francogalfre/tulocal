import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/screen";
import { findOwnedProduct } from "@/features/product/find";
import { Gallery } from "@/features/product/gallery";
import { Stages } from "@/features/product/progress/stages";
import { Qr } from "@/features/product/published/qr";
import { Share } from "@/features/product/published/share";
import { retryPipeline } from "@/features/product/retry";
import { Comparables } from "@/features/product/review/comparables";
import { ReviewForm } from "@/features/product/review/form";
import type { OwnedProduct } from "@/features/product/find";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreUrl } from "@/lib/url";

type ProductPageProps = PageProps<"/product/[id]">;

function Processing({ product }: { product: OwnedProduct }) {
  return (
    <>
      <Gallery images={product.images} />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl">armando la publicación</h1>
        <Stages currentStage={product.pipelineStage} />
        <p className="text-sm text-muted-foreground">
          tarda menos de un minuto. podés quedarte acá.
        </p>
      </div>
    </>
  );
}

function Failed({ product }: { product: OwnedProduct }) {
  return (
    <>
      <Gallery images={product.images} />
      <Alert variant="destructive">
        <AlertTitle>no pudimos armar la publicación</AlertTitle>
        <AlertDescription>{product.pipelineError}</AlertDescription>
      </Alert>
      <form action={retryPipeline} className="flex flex-col gap-3">
        <input type="hidden" name="productId" value={product.id} />
        <Button type="submit" size="lg">
          probar de nuevo
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/new" />} nativeButton={false}>
          subir otras fotos
        </Button>
      </form>
    </>
  );
}

function Review({ product }: { product: OwnedProduct }) {
  return (
    <>
      <Gallery images={product.images} />
      <ReviewForm product={product} />
      <Comparables comparables={product.comparables} />
    </>
  );
}

function Published({ product }: { product: OwnedProduct }) {
  const storeUrl = buildStoreUrl(product.store.handle);

  return (
    <>
      <div className="flex flex-col gap-3">
        <Badge>publicado</Badge>
        <h1 className="text-3xl">listo, ya está publicado</h1>
        <a href={storeUrl} className="font-heading text-xl font-semibold text-primary">
          tulocal/{product.store.handle}
        </a>
        <p className="text-muted-foreground">compartilo por WhatsApp, Instagram o con el QR.</p>
      </div>
      <Qr url={storeUrl} />
      <Share url={storeUrl} />
      <Button size="lg" variant="ghost" render={<Link href="/new" />} nativeButton={false}>
        subir otro producto
      </Button>
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await requireCurrentSession();
  const { id } = await params;
  const product = await findOwnedProduct(id, session.user.id);

  if (product === null) {
    notFound();
  }

  return (
    <Screen>
      {product.status === "processing" ? <Processing product={product} /> : null}
      {product.status === "failed" ? <Failed product={product} /> : null}
      {product.status === "review" ? <Review product={product} /> : null}
      {product.status === "published" || product.status === "sold" ? (
        <Published product={product} />
      ) : null}
    </Screen>
  );
}
