import type { ExportSource, SceneFormat } from "@/features/product/export/formats";
import type { ExportableProduct } from "@/features/product/export/exportable";

export type SelectPieceImagesInput = {
  product: ExportableProduct;
  source: ExportSource;
};

export type CarouselImageUrls = {
  cover: string;
  scene: string;
};

type OwnedImage = ExportableProduct["images"][number];

function listImageUrls(images: OwnedImage[], kind: OwnedImage["kind"]): string[] {
  return images.filter((image) => image.kind === kind).map((image) => image.url);
}

function findReadySceneUrl(product: ExportableProduct, format: SceneFormat): string | null {
  const scene = product.scenes.find((candidate) => candidate.format === format);

  if (scene === undefined || scene.status !== "ready" || scene.url === null) {
    return null;
  }

  return scene.url;
}

function selectPrimaryUrl(images: OwnedImage[]): string | null {
  const [primary] = listImageUrls(images, "primary");
  const [original] = listImageUrls(images, "original");

  return primary ?? original ?? null;
}

export function selectStoryImageUrl(input: SelectPieceImagesInput): string | null {
  if (input.source === "generated") {
    return findReadySceneUrl(input.product, "story");
  }

  const [contextual] = listImageUrls(input.product.images, "contextual");

  return contextual ?? selectPrimaryUrl(input.product.images);
}

export function selectCarouselImageUrls(input: SelectPieceImagesInput): CarouselImageUrls | null {
  const primary = selectPrimaryUrl(input.product.images);

  if (primary === null) {
    return null;
  }

  if (input.source === "generated") {
    const generated = findReadySceneUrl(input.product, "carousel");

    return generated === null ? null : { cover: generated, scene: primary };
  }

  const [firstContextual, secondContextual] = listImageUrls(input.product.images, "contextual");

  return { cover: primary, scene: secondContextual ?? firstContextual ?? primary };
}
