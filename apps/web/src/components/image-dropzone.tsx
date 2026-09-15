"use client";

import { Button } from "@tulocal/ui/components/button";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_FILES = 8;

export function ImageDropzone({
  files,
  onChange,
  disabled,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [files]);

  function add(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = [...list].filter((file) => file.type.startsWith("image/"));
    onChange([...files, ...incoming].slice(0, MAX_FILES));
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          add(event.dataTransfer.files);
        }}
        className={`flex min-h-40 w-full flex-col items-center justify-center gap-2 border border-dashed p-6 text-center text-sm transition-colors ${
          dragging ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
        } disabled:opacity-50`}
      >
        <ImagePlus className="size-6 text-muted-foreground" />
        <span className="font-medium">Arrastrá tus fotos o tocá para elegir</span>
        <span className="text-xs text-muted-foreground">
          Hasta {MAX_FILES} fotos. Cuanto más claras, mejor salen las imágenes generadas.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          add(event.target.files);
          event.target.value = "";
        }}
      />
      {previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((src, index) => (
            <li key={src} className="group relative aspect-square overflow-hidden bg-muted">
              <img src={src} alt="" className="size-full object-cover" />
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                className="absolute top-1 right-1"
                onClick={() => remove(index)}
                aria-label="Quitar foto"
              >
                <X />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-background/90 px-1.5 py-0.5 text-[10px]">
                  Principal
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
