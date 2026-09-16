import { asc, eq } from "drizzle-orm";

import { database } from "@tulocal/database/client";
import { images } from "@tulocal/database/schema/images";
import { products } from "@tulocal/database/schema/products";
import { stores } from "@tulocal/database/schema/stores";

export type PublicStore = NonNullable<Awaited<ReturnType<typeof queryPublicStore>>>;

const PUBLIC_STORE_COLUMNS = {
  id: true,
  name: true,
  handle: true,
  description: true,
  avatarUrl: true,
  bannerUrl: true,
  whatsappPhone: true,
  agentName: true,
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

async function queryPublicStore(handle: string) {
  return database.query.stores.findFirst({
    where: eq(stores.handle, handle),
    columns: PUBLIC_STORE_COLUMNS,
    with: {
      products: {
        where: eq(products.status, "published"),
        columns: PUBLIC_PRODUCT_COLUMNS,
        with: { images: { orderBy: [asc(images.sortOrder)] } },
      },
    },
  });
}

export async function findPublicStore(handle: string): Promise<PublicStore | null> {
  const store = await queryPublicStore(handle);

  return store ?? null;
}
