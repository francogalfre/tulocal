import { Copy } from "@/features/product/export/copy";
import { writeCaption } from "@/features/product/export/write";
import type { ExportableProduct } from "@/features/product/export/exportable";

type CaptionProps = {
  product: ExportableProduct;
};

export async function Caption({ product }: CaptionProps) {
  const caption = await writeCaption(product);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl">Texto para la publicación</h2>
      <Copy text={caption.text} />
    </section>
  );
}
