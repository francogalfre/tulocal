"use client";

import { useEffect, useState } from "react";

export function useSquareImage(url: string): string | null {
  const [squareUrl, setSquareUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setSquareUrl(null);

    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = () => {
      if (isCancelled) {
        return;
      }

      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const offsetX = (image.naturalWidth - size) / 2;
      const offsetY = (image.naturalHeight - size) / 2;
      const canvas = document.createElement("canvas");

      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");

      if (context === null) {
        return;
      }

      context.drawImage(image, offsetX, offsetY, size, size, 0, 0, size, size);
      setSquareUrl(canvas.toDataURL("image/webp"));
    };

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return squareUrl;
}
