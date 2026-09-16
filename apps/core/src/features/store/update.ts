"use server";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { stores } from "@tulocal/database/schema/stores";
import { uploadBlob } from "@tulocal/storage/blob";

import { findStoreByOwner } from "@/features/store/find";
import { placeFormSchema } from "@/features/store/location/place";
import { derivePublicPlace } from "@/features/store/location/privacy";
import { socialHandleSchema } from "@/features/store/social/handle";
import { logEvent } from "@/lib/logger";
import { argentinePhoneSchema } from "@/lib/phone/schema";
import { requireCurrentSession } from "@/lib/session";
import { buildStoreTag } from "@/lib/tags";

const NAME_MAX_LENGTH = 60;

const DESCRIPTION_MAX_LENGTH = 300;

const AGENT_NAME_MAX_LENGTH = 30;

const MAX_IMAGE_SIZE_IN_BYTES = 8 * 1024 * 1024;

const storeInputSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH),
  whatsappPhone: z.literal("").or(argentinePhoneSchema),
  instagramHandle: socialHandleSchema,
  tiktokHandle: socialHandleSchema,
  facebookHandle: socialHandleSchema,
  xHandle: socialHandleSchema,
  agentName: z.string().trim().min(1).max(AGENT_NAME_MAX_LENGTH),
});

export type UpdateStoreState = {
  error: string | null;
};

function toNullableText(text: string): string | null {
  return text.length === 0 ? null : text;
}

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
    instagramHandle: formData.get("instagramHandle") ?? "",
    tiktokHandle: formData.get("tiktokHandle") ?? "",
    facebookHandle: formData.get("facebookHandle") ?? "",
    xHandle: formData.get("xHandle") ?? "",
    agentName: formData.get("agentName"),
  });

  if (!parsed.success) {
    return {
      error: "Revisá el nombre, la descripción, el WhatsApp, las redes y el nombre de tu vendedor.",
    };
  }

  const parsedPlace = placeFormSchema.safeParse({
    addressLine: formData.get("addressLine") ?? "",
    areaName: formData.get("areaName") ?? "",
    latitude: formData.get("latitude") ?? "",
    longitude: formData.get("longitude") ?? "",
    isAddress: formData.get("isAddress") ?? "",
  });

  if (!parsedPlace.success) {
    return { error: "Elegí la ubicación de la lista." };
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
  const description = toNullableText(parsed.data.description);
  const whatsappPhone =
    parsed.data.whatsappPhone.length === 0 ? store.whatsappPhone : parsed.data.whatsappPhone;
  const place = parsedPlace.data;
  const publicPlace = place === null ? null : derivePublicPlace(place);

  await database
    .update(stores)
    .set({
      name: parsed.data.name,
      description,
      avatarUrl,
      bannerUrl,
      whatsappPhone,
      instagramHandle: toNullableText(parsed.data.instagramHandle),
      tiktokHandle: toNullableText(parsed.data.tiktokHandle),
      facebookHandle: toNullableText(parsed.data.facebookHandle),
      xHandle: toNullableText(parsed.data.xHandle),
      agentName: parsed.data.agentName,
      addressLine: place === null || !place.isAddress ? null : place.addressLine,
      addressLatitude: place === null || !place.isAddress ? null : place.latitude,
      addressLongitude: place === null || !place.isAddress ? null : place.longitude,
      locationName: publicPlace === null ? null : publicPlace.name,
      locationLatitude: publicPlace === null ? null : publicPlace.latitude,
      locationLongitude: publicPlace === null ? null : publicPlace.longitude,
    })
    .where(eq(stores.id, store.id));
  logEvent({ event: "store.updated", storeId: store.id });
  updateTag(buildStoreTag(store.handle));
  redirect(`/${store.handle}`);
}
