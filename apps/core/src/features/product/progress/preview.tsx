import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import type { OwnedProduct } from "@/features/product/find";

const SHOT_LABELS = ["Fondo blanco", "En contexto", "Editorial"] as const;

type PreviewProps = {
  images: OwnedProduct["images"];
  isIdentifying: boolean;
};

export function Preview({ images, isIdentifying }: PreviewProps) {
  const original = images.find((image) => image.kind === "original");
  const generated = images.filter((image) => image.kind !== "original");
  const pendingLabels = SHOT_LABELS.slice(generated.length);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {original !== undefined ? (
          <Image src={original.url} alt="" fill priority sizes="448px" className="object-cover" />
        ) : null}
        {isIdentifying ? (
          <span className="absolute inset-x-0 h-0.5 bg-brand motion-safe:animate-scan" />
        ) : null}
      </div>
      {isIdentifying ? null : (
        <div className="grid grid-cols-3 gap-2">
          {generated.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-muted motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
            >
              <Image src={image.url} alt="" fill sizes="150px" className="object-cover" />
            </div>
          ))}
          {pendingLabels.map((label) => (
            <Skeleton
              key={label}
              className="flex aspect-square items-end justify-start rounded-xl p-3 text-xs font-medium text-muted-foreground"
            >
              {label}
            </Skeleton>
          ))}
        </div>
      )}
    </div>
  );
}
