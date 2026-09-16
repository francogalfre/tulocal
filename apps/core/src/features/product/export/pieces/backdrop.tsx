import { EXPORT_FORMATS } from "@/features/product/export/formats";
import type { SceneFormat } from "@/features/product/export/formats";

type BackdropProps = {
  format: SceneFormat;
  imageUrl: string;
};

export function Backdrop({ format, imageUrl }: BackdropProps) {
  const { width, height } = EXPORT_FORMATS[format];

  return (
    <img
      src={imageUrl}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover" }}
    />
  );
}
