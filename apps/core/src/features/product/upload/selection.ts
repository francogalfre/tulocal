import { MAX_PHOTOS, describeInvalidPhotos } from "@/features/product/upload/limits";

export type SelectedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export type PhotoSelection = {
  photos: SelectedPhoto[];
  rejectedMessage: string | null;
};

function toSelectedPhoto(file: File): SelectedPhoto {
  return { id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) };
}

export function appendPhotos(current: SelectedPhoto[], incoming: File[]): PhotoSelection {
  const remainingSlots = MAX_PHOTOS - current.length;
  const accepted = incoming.slice(0, remainingSlots);

  if (accepted.length === 0) {
    return { photos: current, rejectedMessage: null };
  }

  const rejectedMessage = describeInvalidPhotos(accepted);

  if (rejectedMessage !== null) {
    return { photos: current, rejectedMessage };
  }

  return { photos: [...current, ...accepted.map(toSelectedPhoto)], rejectedMessage: null };
}

export function removePhoto(current: SelectedPhoto[], id: string): SelectedPhoto[] {
  const removed = current.find((photo) => photo.id === id);

  if (removed !== undefined) {
    URL.revokeObjectURL(removed.previewUrl);
  }

  return current.filter((photo) => photo.id !== id);
}

export function promotePhotoToCover(current: SelectedPhoto[], id: string): SelectedPhoto[] {
  const promoted = current.find((photo) => photo.id === id);

  if (promoted === undefined) {
    return current;
  }

  return [promoted, ...current.filter((photo) => photo.id !== id)];
}

export function buildFileList(photos: SelectedPhoto[]): FileList {
  const transfer = new DataTransfer();

  for (const photo of photos) {
    transfer.items.add(photo.file);
  }

  return transfer.files;
}
