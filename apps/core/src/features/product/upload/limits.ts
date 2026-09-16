export const MAX_PHOTOS = 3;

export const MAX_PHOTO_SIZE_IN_BYTES = 15 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"] as const;

function isAllowedPhotoType(mediaType: string): boolean {
  return ALLOWED_PHOTO_TYPES.some((allowed) => allowed === mediaType);
}

export function describeInvalidPhotos(photos: File[]): string | null {
  if (photos.length === 0) {
    return "Elegí al menos una foto.";
  }

  if (photos.length > MAX_PHOTOS) {
    return `Podés subir hasta ${MAX_PHOTOS} fotos.`;
  }

  if (photos.some((photo) => !isAllowedPhotoType(photo.type))) {
    return "Solo aceptamos fotos en JPG, PNG, WEBP o HEIC.";
  }

  if (photos.some((photo) => photo.size > MAX_PHOTO_SIZE_IN_BYTES)) {
    return "Cada foto tiene que pesar menos de 15 MB.";
  }

  return null;
}
