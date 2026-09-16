import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

import { buildStoreTag } from "@/lib/tags";

const PUBLIC_STORE_REVALIDATE_IN_SECONDS = 60 * 60;

const PUBLIC_STORE_COLUMNS = {
  id: true,
  name: true,
  handle: true,
  description: true,
  avatarUrl: true,
  bannerUrl: true,
  whatsappPhone: true,
  agentName: true,
  agentSeed: true,
  agentVoice: true,
  instagramHandle: true,
  tiktokHandle: true,
  facebookHandle: true,
  xHandle: true,
  locationName: true,
  locationLatitude: true,
  locationLongitude: true,
} as const;

const PUBLIC_PRODUCT_COLUMNS = {
  id: true,
  title: true,
  description: true,
  category: true,
  condition: true,
  conditionNotes: true,
  listPriceInArs: true,
  status: true,
  createdAt: true,
} as const;

const PUBLIC_IMAGE_COLUMNS = {
  id: true,
  url: true,
  kind: true,
  sortOrder: true,
} as const;

const PUBLIC_STORE_CACHE_SHAPE = JSON.stringify([
  PUBLIC_STORE_COLUMNS,
  PUBLIC_PRODUCT_COLUMNS,
  PUBLIC_IMAGE_COLUMNS,
]);

type QueriedPublicStore = NonNullable<Awaited<ReturnType<typeof queryPublicStore>>>;

type QueriedPublicProduct = QueriedPublicStore["products"][number];

type SerializedPublicProduct = Omit<QueriedPublicProduct, "createdAt"> & { createdAtIso: string };

type SerializedPublicStore = Omit<QueriedPublicStore, "products"> & {
  products: SerializedPublicProduct[];
};

export type PublicStore = QueriedPublicStore;

async function queryPublicStore(handle: string) {
  return database.query.stores.findFirst({
    where: eq(stores.handle, handle),
    columns: PUBLIC_STORE_COLUMNS,
    with: {
      products: {
        where: eq(products.status, "published"),
        columns: PUBLIC_PRODUCT_COLUMNS,
        with: { images: { columns: PUBLIC_IMAGE_COLUMNS, orderBy: [asc(images.sortOrder)] } },
      },
    },
  });
}

function serializeProduct(product: QueriedPublicProduct): SerializedPublicProduct {
  const { createdAt, ...rest } = product;

  return { ...rest, createdAtIso: createdAt.toISOString() };
}

function reviveProduct(product: SerializedPublicProduct): QueriedPublicProduct {
  const { createdAtIso, ...rest } = product;

  return { ...rest, createdAt: new Date(createdAtIso) };
}

async function querySerializedPublicStore(handle: string): Promise<SerializedPublicStore | null> {
  const store = await queryPublicStore(handle);

  if (store === undefined) {
    return null;
  }

  return { ...store, products: store.products.map(serializeProduct) };
}

function readCachedPublicStore(handle: string): Promise<SerializedPublicStore | null> {
  return unstable_cache(
    () => querySerializedPublicStore(handle),
    [handle, PUBLIC_STORE_CACHE_SHAPE],
    { tags: [buildStoreTag(handle)], revalidate: PUBLIC_STORE_REVALIDATE_IN_SECONDS },
  )();
}

async function findPublicStoreOnce(handle: string): Promise<PublicStore | null> {
  const store = await readCachedPublicStore(handle);

  if (store === null) {
    return null;
  }

  return { ...store, products: store.products.map(reviveProduct) };
}

export const findPublicStore = cache(findPublicStoreOnce);
