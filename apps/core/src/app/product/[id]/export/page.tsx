import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { Screen } from "@/components/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { findSceneUsage } from "@/features/plan/limits/scenes";
import { Caption } from "@/features/product/export/caption";
import { isExportableProduct } from "@/features/product/export/exportable";
import { Exporter } from "@/features/product/export/exporter";
import { findOwnedProduct } from "@/features/product/find";
import { StoreLink } from "@/features/store/link";
import { requireCurrentSession } from "@/lib/session";

type ProductExportPageProps = PageProps<"/product/[id]/export">;

export const metadata: Metadata = {
  title: "Exportar a Instagram",
  robots: { index: false },
};

export default async function ProductExportPage({ params }: ProductExportPageProps) {
  const session = await requireCurrentSession();
  const { id } = await params;
  const product = await findOwnedProduct(id, session.user.id);

  if (product === null) {
    notFound();
  }

  if (!isExportableProduct(product)) {
    redirect(`/product/${id}`);
  }

  const sceneUsage = await findSceneUsage(product.store.id);

  return (
    <Screen aside={<StoreLink handle={product.store.handle} />}>
      <Reveal className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Exportar a Instagram</h1>
          <p className="text-muted-foreground">
            Elegí el formato, descargá la imagen y subila desde la app de Instagram.
          </p>
        </div>
        <Exporter
          productId={product.id}
          scenes={product.scenes}
          canGenerateScenes={sceneUsage.monthlySceneLimit > 0}
          remainingScenes={Math.max(
            sceneUsage.monthlySceneLimit - sceneUsage.generatedThisMonth,
            0,
          )}
        />
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
          <Caption product={product} />
        </Suspense>
      </Reveal>
    </Screen>
  );
}
