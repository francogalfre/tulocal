import type { NextRequest } from "next/server";
import type { ReactElement } from "react";

import { findExportableProduct } from "@/features/product/export/owner";
import { ClosingPiece } from "@/features/product/export/pieces/closing";
import { CoverPiece } from "@/features/product/export/pieces/cover";
import { ScenePiece } from "@/features/product/export/pieces/scene";
import { renderPiece } from "@/features/product/export/render";
import { carouselSlideSchema, exportSourceSchema } from "@/features/product/export/schema";
import { selectCarouselImageUrls } from "@/features/product/export/select";
import type { ExportableProduct } from "@/features/product/export/exportable";
import type { CarouselImageUrls } from "@/features/product/export/select";

const DEFAULT_SOURCE = "photo";

const NOT_FOUND_STATUS = 404;

type CarouselSlide = (typeof carouselSlideSchema.options)[number];

type SlideInput = {
  product: ExportableProduct;
  imageUrls: CarouselImageUrls;
};

const SLIDES: Record<CarouselSlide, (input: SlideInput) => ReactElement> = {
  "1": ({ product, imageUrls }) => (
    <CoverPiece imageUrl={imageUrls.cover} priceInArs={product.listPriceInArs} />
  ),
  "2": ({ imageUrls }) => <ScenePiece imageUrl={imageUrls.scene} />,
  "3": ({ product }) => <ClosingPiece title={product.title} priceInArs={product.listPriceInArs} />,
};

export async function GET(
  request: NextRequest,
  context: RouteContext<"/product/[id]/export/carousel">,
): Promise<Response> {
  const { id } = await context.params;
  const source = exportSourceSchema.safeParse(
    request.nextUrl.searchParams.get("scene") ?? DEFAULT_SOURCE,
  );
  const slide = carouselSlideSchema.safeParse(request.nextUrl.searchParams.get("slide"));
  const product = await findExportableProduct(id);

  if (!source.success || !slide.success || product === null) {
    return new Response(null, { status: NOT_FOUND_STATUS });
  }

  const imageUrls = selectCarouselImageUrls({ product, source: source.data });

  if (imageUrls === null) {
    return new Response(null, { status: NOT_FOUND_STATUS });
  }

  return renderPiece({
    format: "carousel",
    fileName: `carrusel-${slide.data}.png`,
    element: SLIDES[slide.data]({ product, imageUrls }),
  });
}
