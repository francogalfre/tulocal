import { notFound } from "next/navigation";

import { Screen } from "@/components/screen";
import { findOwnedProduct } from "@/features/product/find";
import { Gallery } from "@/features/product/gallery";
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

  return (
    <Screen aside={<StoreLink handle={product.store.handle} />}>
      <h1 className="text-3xl">Editar publicación</h1>
      <Gallery images={product.images} />
      <ReviewForm product={product} mode="edit" />
    </Screen>
  );
}
