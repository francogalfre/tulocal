"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import { tulocalIcons } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createProduct } from "@/features/product/create";
import { compressPhoto } from "@/features/product/upload/compress";
import { Hint } from "@/features/product/upload/hint";
import { MAX_PHOTOS } from "@/features/product/upload/limits";
import { Photo } from "@/features/product/upload/photo";
import {
  appendPhotos,
  buildFileList,
  promotePhotoToCover,
  removePhoto,
} from "@/features/product/upload/selection";
import { Slot } from "@/features/product/upload/slot";
import { riseVariants } from "@/lib/motion/rise";
import { cn } from "@/lib/utils";
import type { CreateProductState } from "@/features/product/create";
import type { SelectedPhoto } from "@/features/product/upload/selection";

const INITIAL_STATE: CreateProductState = { error: null };

const CELL_CLASSES = ["col-span-2 row-span-2", "aspect-square", "aspect-square"] as const;

const SLOT_INDEXES = Array.from({ length: MAX_PHOTOS }, (_, index) => index);

async function submitCompressedProduct(
  previousState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const photos = formData.getAll("photos").filter((entry) => entry instanceof File);
  const compressedPhotos = await Promise.all(photos.map((photo) => compressPhoto(photo)));
  const compressedFormData = new FormData();

  for (const photo of compressedPhotos) {
    compressedFormData.append("photos", photo);
  }

  return createProduct(previousState, compressedFormData);
}

export function Dropzone() {
  const [state, submit, isPending] = useActionState(submitCompressedProduct, INITIAL_STATE);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputReference = useRef<HTMLInputElement>(null);
  const developedIdsReference = useRef(new Set<string>());
  const hasPhotos = photos.length > 0;
  const nextEmptyIndex = photos.length;
  const visibleError = rejectedMessage !== null ? rejectedMessage : state.error;

  useEffect(() => {
    for (const photo of photos) {
      developedIdsReference.current.add(photo.id);
    }
  }, [photos]);

  function applyPhotos(next: SelectedPhoto[]): void {
    setPhotos(next);

    if (inputReference.current !== null) {
      inputReference.current.files = buildFileList(next);
    }
  }

  function acceptFiles(fileList: FileList | null): void {
    const selection = appendPhotos(photos, Array.from(fileList ?? []));

    setRejectedMessage(selection.rejectedMessage);
    applyPhotos(selection.photos);
  }

  function openPicker(): void {
    inputReference.current?.click();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    acceptFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    acceptFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsDragging(false);
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="grid grid-cols-3 gap-2"
      >
        {SLOT_INDEXES.map((index) => {
          const photo = photos[index];

          return (
            <div key={index} className={cn("relative", CELL_CLASSES[index])}>
              <AnimatePresence initial={false}>
                {photo !== undefined ? (
                  <Photo
                    key={photo.id}
                    photo={photo}
                    position={index + 1}
                    isCover={index === 0}
                    isUploading={isPending}
                    isNew={!developedIdsReference.current.has(photo.id)}
                    onRemove={(id) => applyPhotos(removePhoto(photos, id))}
                    onPromote={(id) => applyPhotos(promotePhotoToCover(photos, id))}
                  />
                ) : (
                  <Slot
                    key="slot"
                    isCover={index === 0}
                    isNext={index === nextEmptyIndex}
                    isDragging={isDragging}
                    onPick={openPicker}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <input
          ref={inputReference}
          name="photos"
          type="file"
          accept="image/*"
          multiple
          tabIndex={-1}
          className="sr-only"
          onChange={handleChange}
        />
      </div>
      <Hint count={photos.length} />
      {visibleError !== null ? (
        <Alert variant="destructive">
          <tulocalIcons.close aria-hidden="true" />
          <AlertDescription>{visibleError}</AlertDescription>
        </Alert>
      ) : null}
      <AnimatePresence initial={false}>
        {hasPhotos ? (
          <motion.div
            key="submit"
            variants={riseVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col"
          >
            <Button type="submit" size="xl" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              {isPending ? "Subiendo las fotos" : "Armar la publicación"}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
