"use client";

import { Camera } from "lucide-react";
import { useActionState, useState } from "react";
import type { ChangeEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createProduct } from "@/features/product/create";
import type { CreateProductState } from "@/features/product/create";

const MAX_PHOTOS = 3;

const INITIAL_STATE: CreateProductState = { error: null };

export function Dropzone() {
  const [state, submit, isPending] = useActionState(createProduct, INITIAL_STATE);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  function handlePhotosChange(event: ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS);

    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <label
        htmlFor="photos"
        className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-center"
      >
        <Camera className="text-muted-foreground" />
        <span className="font-medium">sacá o subí hasta {MAX_PHOTOS} fotos</span>
        <span className="text-sm text-muted-foreground">de tu primer producto</span>
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          required
          className="sr-only"
          onChange={handlePhotosChange}
        />
      </label>
      {previewUrls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {previewUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}
      {state.error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending || previewUrls.length === 0}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "subiendo las fotos" : "subir fotos"}
      </Button>
    </form>
  );
}
