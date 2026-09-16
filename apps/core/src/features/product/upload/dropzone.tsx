"use client";

import { useActionState, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import { Develop } from "@/components/motion/develop";
import { tulocalIcons } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createProduct } from "@/features/product/create";
import type { CreateProductState } from "@/features/product/create";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 3;

const INITIAL_STATE: CreateProductState = { error: null };

export function Dropzone() {
  const [state, submit, isPending] = useActionState(createProduct, INITIAL_STATE);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputReference = useRef<HTMLInputElement>(null);
  const hasPhotos = previewUrls.length > 0;

  function acceptFiles(fileList: FileList | null): void {
    const files = Array.from(fileList ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_PHOTOS);
    const transfer = new DataTransfer();

    for (const file of files) {
      transfer.items.add(file);
    }

    if (inputReference.current !== null) {
      inputReference.current.files = transfer.files;
    }

    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    acceptFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(false);
    acceptFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(true);
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <label
        htmlFor="photos"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center transition-[background-color,border-color,transform] duration-200 hover:border-brand-deep/60 hover:bg-muted/60 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          isDragging ? "scale-[1.01] border-brand-deep bg-muted" : "border-border",
          hasPhotos ? "min-h-0 py-5" : "",
        )}
      >
        {hasPhotos ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <tulocalIcons.imageAdd className="size-4" aria-hidden="true" />
            Cambiar fotos
          </span>
        ) : (
          <>
            <tulocalIcons.camera className="size-7 text-brand-deep" aria-hidden="true" />
            <span className="flex flex-col gap-1">
              <span className="font-medium">Sacá o subí hasta {MAX_PHOTOS} fotos</span>
              <span className="text-sm text-muted-foreground">
                Con luz natural y el producto entero en cuadro sale mejor.
              </span>
            </span>
          </>
        )}
        <input
          ref={inputReference}
          id="photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          required
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      {hasPhotos ? (
        <div className="grid grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <Develop
              key={url}
              className="relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <img src={url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
            </Develop>
          ))}
        </div>
      ) : null}
      {state.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="xl" disabled={isPending || !hasPhotos}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "Subiendo las fotos" : "Armar la publicación"}
      </Button>
    </form>
  );
}
