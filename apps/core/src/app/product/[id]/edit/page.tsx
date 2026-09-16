import { notFound, redirect } from "next/navigation";

import { Screen } from "@/components/screen";
import { findOwnedProduct } from "@/features/product/find";
import { Gallery } from "@/features/product/gallery/grid";
import { ReviewForm } from "@/features/product/review/form";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";

type ProductEditPageProps = PageProps<"/product/[id]/edit">;

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const session = await requireCurrentSession();
  const { id } = await params;
  const product = await findOwnedProduct(id, session.user.id);

  if (product === null) {
    notFound();
  }

  if (product.status === "sold") {
    redirect(`/product/${id}`);
  }

  return (
    <Screen aside={<StoreLink handle={product.store.handle} />}>
      <h1 className="text-3xl">Editar publicación</h1>
      <Gallery images={product.images} ownerProductId={product.id} />
      <p className="-mt-6 text-sm text-muted-foreground">
        Tocá una foto para verla grande, elegir la portada o cambiar el orden.
      </p>
      <ReviewForm product={product} mode="edit" />
    </Screen>
  );
}
