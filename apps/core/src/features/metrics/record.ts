import { database } from "@tulocal/database/client";
import { visits } from "@tulocal/database/schema/visits";

export async function recordStoreVisit(storeId: string): Promise<void> {
  await database.insert(visits).values({ storeId, kind: "store" });
}

export async function recordProductVisit(storeId: string, productId: string): Promise<void> {
  await database.insert(visits).values({ storeId, productId, kind: "product" });
}

export async function recordWhatsappClick(storeId: string, productId: string): Promise<void> {
  await database.insert(visits).values({ storeId, productId, kind: "whatsapp" });
}
