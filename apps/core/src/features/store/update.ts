"use server";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { stores } from "@tulocal/database/schema/stores";
import { uploadBlob } from "@tulocal/storage/blob";

import { findStoreByOwner } from "@/features/store/find";
import { logEvent } from "@/lib/logger";
import { requireCurrentSession } from "@/lib/session";

const NAME_MAX_LENGTH = 60;

const DESCRIPTION_MAX_LENGTH = 300;

const MAX_IMAGE_SIZE_IN_BYTES = 8 * 1024 * 1024;

const WHATSAPP_DIGITS_PATTERN = /^\+?\d{8,15}$/;

const storeInputSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH),
  whatsappPhone: z
    .string()
    .trim()
    .transform((phone) => phone.replaceAll(/[\s-]/g, ""))
    .pipe(z.string().regex(WHATSAPP_DIGITS_PATTERN).or(z.literal(""))),
});

export type UpdateStoreState = {
  error: string | null;
};

function readImage(formData: FormData, key: string): File | null {
  const entry = formData.get(key);

  if (!(entry instanceof File) || entry.size === 0) {
    return null;
  }

  return entry;
}

function buildImageExtension(mediaType: string): string {
  return mediaType === "image/jpeg" ? "jpg" : (mediaType.split("/")[1] ?? "jpg");
}

async function uploadStoreImage(storeId: string, kind: string, image: File): Promise<string> {
  const stored = await uploadBlob({
    pathname: `stores/${storeId}/${kind}-${randomUUID()}.${buildImageExtension(image.type)}`,
    body: image,
    contentType: image.type,
  });

  return stored.url;
}

export async function updateStore(
  _previousState: UpdateStoreState,
  formData: FormData,
): Promise<UpdateStoreState> {
  const session = await requireCurrentSession();
  const store = await findStoreByOwner(session.user.id);

  if (store === null) {
    return { error: "Todavía no tenés una tienda." };
  }

  const parsed = storeInputSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    whatsappPhone: formData.get("whatsappPhone") ?? "",
  });

  if (!parsed.success) {
    return { error: "Revisá el nombre, la descripción y el WhatsApp." };
  }

  const avatar = readImage(formData, "avatar");
  const banner = readImage(formData, "banner");

  if (
    (avatar?.size ?? 0) > MAX_IMAGE_SIZE_IN_BYTES ||
    (banner?.size ?? 0) > MAX_IMAGE_SIZE_IN_BYTES
  ) {
    return { error: "Las imágenes tienen que pesar menos de 8 MB." };
  }

  const avatarUrl =
    avatar === null ? store.avatarUrl : await uploadStoreImage(store.id, "avatar", avatar);
  const bannerUrl =
    banner === null ? store.bannerUrl : await uploadStoreImage(store.id, "banner", banner);
  const description = parsed.data.description.length === 0 ? null : parsed.data.description;
  const whatsappPhone =
    parsed.data.whatsappPhone.length === 0 ? store.whatsappPhone : parsed.data.whatsappPhone;

  await database
    .update(stores)
    .set({ name: parsed.data.name, description, avatarUrl, bannerUrl, whatsappPhone })
    .where(eq(stores.id, store.id));
  logEvent({ event: "store.updated", storeId: store.id });
  revalidatePath(`/${store.handle}`);
  redirect(`/${store.handle}`);
}
