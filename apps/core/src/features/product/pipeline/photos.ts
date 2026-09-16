export type Photo = {
  bytes: Uint8Array;
  mediaType: string;
};

export async function downloadPhoto(url: string): Promise<Photo> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not download photo ${url}: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  if (contentType === null) {
    throw new Error(`Photo ${url} has no content type`);
  }

  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    mediaType: contentType.split(";")[0] ?? contentType,
  };
}

export function selectSourcePhoto(photos: Photo[], preferredIndex: number): Photo {
  const preferred = photos[preferredIndex];

  if (preferred !== undefined) {
    return preferred;
  }

  const first = photos[0];

  if (first !== undefined) {
    return first;
  }

  throw new Error("There are no photos to work with");
}
