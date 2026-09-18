import { asc, desc, eq, isNull, ne } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";
import { subscriptions } from "@tulocal/database/schema/subscriptions";

import { resolvePlan } from "@/features/plan/access/resolve";
import type { SubscriptionAccess } from "@/features/plan/access/resolve";
import { PLAN_ORDER, PLANS } from "@/features/plan/catalog";
import { selectCoverUrl } from "@/features/store/catalog";
import { DIRECTORY_TAG } from "@/lib/tags";

const DIRECTORY_REVALIDATE_IN_SECONDS = 3600;

const DIRECTORY_STORE_COLUMNS = {
  id: true,
  name: true,
  handle: true,
  description: true,
  avatarUrl: true,
  bannerUrl: true,
  locationName: true,
} as const;

const DIRECTORY_PRODUCT_COLUMNS = {
  id: true,
  title: true,
  description: true,
  brand: true,
  model: true,
  category: true,
  listPriceInArs: true,
} as const;

const DIRECTORY_IMAGE_COLUMNS = {
  url: true,
  kind: true,
} as const;

const DIRECTORY_SUBSCRIPTION_COLUMNS = {
  plan: true,
  status: true,
  accessEndsAt: true,
} as const;

const DIRECTORY_CACHE_SHAPE = JSON.stringify([
  DIRECTORY_STORE_COLUMNS,
  DIRECTORY_PRODUCT_COLUMNS,
  DIRECTORY_IMAGE_COLUMNS,
  DIRECTORY_SUBSCRIPTION_COLUMNS,
]);

type QueriedDirectoryStore = Awaited<ReturnType<typeof queryDirectoryStores>>[number];

type QueriedDirectoryProduct = QueriedDirectoryStore["products"][number];

type QueriedDirectorySubscription = QueriedDirectoryStore["subscriptions"][number];

type SerializedSubscription = Omit<QueriedDirectorySubscription, "accessEndsAt"> & {
  accessEndsAtIso: string | null;
};

type Promotion = {
  verifiedPlanName: string | null;
  promotionRank: number;
};

export type DirectoryProduct = Omit<QueriedDirectoryProduct, "images"> &
  Promotion & {
    coverUrl: string | null;
    storeName: string;
    storeHandle: string;
  };

type SerializedDirectoryStore = Omit<QueriedDirectoryStore, "products" | "subscriptions"> & {
  products: Omit<DirectoryProduct, keyof Promotion>[];
  subscriptions: SerializedSubscription[];
};

export type DirectoryStore = Omit<SerializedDirectoryStore, "products" | "subscriptions"> &
  Promotion & {
    products: DirectoryProduct[];
  };

async function queryDirectoryStores() {
  return database.query.stores.findMany({
    where: isNull(stores.suspendedAt),
    columns: DIRECTORY_STORE_COLUMNS,
    with: {
      products: {
        where: eq(products.status, "published"),
        columns: DIRECTORY_PRODUCT_COLUMNS,
        orderBy: [desc(products.publishedAt)],
        with: { images: { columns: DIRECTORY_IMAGE_COLUMNS, orderBy: [asc(images.sortOrder)] } },
      },
      subscriptions: {
        where: ne(subscriptions.status, "pending"),
        columns: DIRECTORY_SUBSCRIPTION_COLUMNS,
      },
    },
  });
}

function serializeStore(store: QueriedDirectoryStore): SerializedDirectoryStore {
  return {
    ...store,
    products: store.products.map(({ images: productImages, ...product }) => ({
      ...product,
      coverUrl: selectCoverUrl(productImages),
      storeName: store.name,
      storeHandle: store.handle,
    })),
    subscriptions: store.subscriptions.map(({ accessEndsAt, ...subscription }) => ({
      ...subscription,
      accessEndsAtIso: accessEndsAt === null ? null : accessEndsAt.toISOString(),
    })),
  };
}

async function querySerializedDirectory(): Promise<SerializedDirectoryStore[]> {
  const queriedStores = await queryDirectoryStores();

  return queriedStores.filter((store) => store.products.length > 0).map(serializeStore);
}

function reviveSubscription(subscription: SerializedSubscription): SubscriptionAccess {
  return {
    plan: subscription.plan,
    status: subscription.status,
    accessEndsAt:
      subscription.accessEndsAtIso === null ? null : new Date(subscription.accessEndsAtIso),
  };
}

function resolvePromotion(storeSubscriptions: SerializedSubscription[], now: Date): Promotion {
  const plan = resolvePlan(storeSubscriptions.map(reviveSubscription), now);
  const details = PLANS[plan];

  return {
    verifiedPlanName: details.isVerified ? details.name : null,
    promotionRank: PLAN_ORDER.indexOf(plan),
  };
}

function promoteStore(store: SerializedDirectoryStore, now: Date): DirectoryStore {
  const { subscriptions: storeSubscriptions, products: storeProducts, ...profile } = store;
  const promotion = resolvePromotion(storeSubscriptions, now);

  return {
    ...profile,
    ...promotion,
    products: storeProducts.map((product) => ({ ...product, ...promotion })),
  };
}

function compareStores(first: DirectoryStore, second: DirectoryStore): number {
  if (first.promotionRank !== second.promotionRank) {
    return second.promotionRank - first.promotionRank;
  }

  return second.products.length - first.products.length;
}

function readCachedDirectory(): Promise<SerializedDirectoryStore[]> {
  return unstable_cache(querySerializedDirectory, ["directory", DIRECTORY_CACHE_SHAPE], {
    tags: [DIRECTORY_TAG],
    revalidate: DIRECTORY_REVALIDATE_IN_SECONDS,
  })();
}

async function findDirectoryOnce(): Promise<DirectoryStore[]> {
  const serializedStores = await readCachedDirectory();
  const now = new Date();

  return serializedStores.map((store) => promoteStore(store, now)).sort(compareStores);
}

export const findDirectory = cache(findDirectoryOnce);
