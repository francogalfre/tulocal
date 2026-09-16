const MAX_DIMENSION_IN_PIXELS = 2000;

const TARGET_MAX_BYTES_PER_PHOTO = 1.2 * 1024 * 1024;

const COMPRESSION_QUALITY_STEPS = [0.82, 0.7, 0.6, 0.5, 0.4] as const;

async function tryDecodePhoto(photo: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(photo);
  } catch {
    return null;
  }
}

function buildScaledCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const scale = Math.min(1, MAX_DIMENSION_IN_PIXELS / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");

  if (context === null) {
    return canvas;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function encodeCanvasAtQuality(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

async function encodeSmallestBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  let smallest: Blob | null = null;

  for (const quality of COMPRESSION_QUALITY_STEPS) {
    const blob = await encodeCanvasAtQuality(canvas, quality);

    if (blob === null) {
      continue;
    }

    if (smallest === null || blob.size < smallest.size) {
      smallest = blob;
    }

    if (blob.size <= TARGET_MAX_BYTES_PER_PHOTO) {
      break;
    }
  }

  return smallest;
}

export async function compressPhoto(photo: File): Promise<File> {
  const bitmap = await tryDecodePhoto(photo);

  if (bitmap === null) {
    return photo;
  }

  const canvas = buildScaledCanvas(bitmap);
  bitmap.close();

  const blob = await encodeSmallestBlob(canvas);

  if (blob === null || blob.size >= photo.size) {
    return photo;
  }

  return new File([blob], photo.name, { type: blob.type });
}
