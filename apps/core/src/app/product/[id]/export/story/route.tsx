import type { NextRequest } from "next/server";

import { findExportableProduct } from "@/features/product/export/owner";
import { StoryPiece } from "@/features/product/export/pieces/story";
import { renderPiece } from "@/features/product/export/render";
import { exportSourceSchema } from "@/features/product/export/schema";
import { selectStoryImageUrl } from "@/features/product/export/select";

const DEFAULT_SOURCE = "photo";

const NOT_FOUND_STATUS = 404;

export async function GET(
  request: NextRequest,
  context: RouteContext<"/product/[id]/export/story">,
): Promise<Response> {
  const { id } = await context.params;
  const source = exportSourceSchema.safeParse(
    request.nextUrl.searchParams.get("scene") ?? DEFAULT_SOURCE,
  );
  const product = await findExportableProduct(id);

  if (!source.success || product === null) {
    return new Response(null, { status: NOT_FOUND_STATUS });
  }

  const imageUrl = selectStoryImageUrl({ product, source: source.data });

  if (imageUrl === null) {
    return new Response(null, { status: NOT_FOUND_STATUS });
  }

  return renderPiece({
    format: "story",
    fileName: "historia.png",
    element: (
      <StoryPiece imageUrl={imageUrl} title={product.title} priceInArs={product.listPriceInArs} />
    ),
  });
}
