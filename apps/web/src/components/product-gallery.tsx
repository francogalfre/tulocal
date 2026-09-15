"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  title,
}: {
  images: { id: string; url: string; kind: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center bg-muted text-sm">
        Sin fotos
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square overflow-hidden bg-muted">
        <img src={current.url} alt={title} className="size-full object-contain" />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                className={`aspect-square w-full overflow-hidden bg-muted ring-1 ${
                  index === active ? "ring-primary" : "ring-transparent"
                }`}
                aria-label={`Ver foto ${index + 1}`}
              >
                <img src={image.url} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
