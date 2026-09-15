import { del, put } from "@vercel/blob";

import { storageEnvironment } from "@tulocal/environment/storage";

const PUBLIC_ACCESS = "public";

export type UploadBlobInput = {
  pathname: string;
  body: Blob | ArrayBuffer;
  contentType: string;
};

export type StoredBlob = {
  url: string;
  pathname: string;
  contentType: string;
};

export async function uploadBlob(input: UploadBlobInput): Promise<StoredBlob> {
  const uploaded = await put(input.pathname, input.body, {
    access: PUBLIC_ACCESS,
    contentType: input.contentType,
    addRandomSuffix: true,
    token: storageEnvironment.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: uploaded.url,
    pathname: uploaded.pathname,
    contentType: uploaded.contentType,
  };
}

export async function removeBlob(url: string): Promise<void> {
  await del(url, { token: storageEnvironment.BLOB_READ_WRITE_TOKEN });
}
