"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { users } from "@tulocal/database/schema/authentication";
import { stores } from "@tulocal/database/schema/stores";
import { subscriptions } from "@tulocal/database/schema/subscriptions";
import { isPaymentsEnabled } from "@tulocal/payments/client";
import { cancelPreapproval } from "@tulocal/payments/preapproval";

import { requireSuperadminSession } from "@/lib/admin";
import { logEvent } from "@/lib/logger";
import { refreshDirectory, refreshPublicStore } from "@/lib/tags";

const NAME_MAX_LENGTH = 60;

const DESCRIPTION_MAX_LENGTH = 300;

const storeIdSchema = z.uuid();

const updateStoreSchema = z.object({
  storeId: z.uuid(),
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH),
});

export type UpdateAdminStoreState = {
  error: string | null;
};

type AdminStoreRow = {
  handle: string;
  ownerEmail: string;
};

async function findStore(storeId: string): Promise<AdminStoreRow | undefined> {
  const rows = await database
    .select({ handle: stores.handle, ownerEmail: users.email })
    .from(stores)
    .innerJoin(users, eq(users.id, stores.ownerId))
    .where(eq(stores.id, storeId));

  return rows[0];
}

function parseStoreId(formData: FormData): string | null {
  const result = storeIdSchema.safeParse(formData.get("storeId"));

  return result.success ? result.data : null;
}

function invalidateStore(handle: string): void {
  refreshPublicStore(handle);
}

export async function suspendStore(formData: FormData): Promise<void> {
  await requireSuperadminSession();
  const storeId = parseStoreId(formData);

  if (storeId === null) {
    return;
  }

  const store = await findStore(storeId);

  if (store === undefined) {
    return;
  }

  await database.update(stores).set({ suspendedAt: new Date() }).where(eq(stores.id, storeId));
  logEvent({ event: "admin.store.suspended", storeId });
  invalidateStore(store.handle);
  revalidatePath("/admin");
  redirect(`/admin/stores/${storeId}`);
}

export async function reactivateStore(formData: FormData): Promise<void> {
  await requireSuperadminSession();
  const storeId = parseStoreId(formData);

  if (storeId === null) {
    return;
  }

  const store = await findStore(storeId);

  if (store === undefined) {
    return;
  }

  await database.update(stores).set({ suspendedAt: null }).where(eq(stores.id, storeId));
  logEvent({ event: "admin.store.reactivated", storeId });
  invalidateStore(store.handle);
  revalidatePath("/admin");
  redirect(`/admin/stores/${storeId}`);
}

export async function deleteStore(formData: FormData): Promise<void> {
  await requireSuperadminSession();
  const storeId = parseStoreId(formData);

  if (storeId === null) {
    return;
  }

  const store = await findStore(storeId);

  if (store === undefined) {
    return;
  }

  await database.delete(stores).where(eq(stores.id, storeId));
  logEvent({ event: "admin.store.deleted", storeId });
  invalidateStore(store.handle);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function grantPro(formData: FormData): Promise<void> {
  await requireSuperadminSession();
  const storeId = parseStoreId(formData);

  if (storeId === null) {
    return;
  }

  const store = await findStore(storeId);

  if (store === undefined) {
    return;
  }

  await database.insert(subscriptions).values({
    storeId,
    plan: "pro",
    status: "authorized",
    payerEmail: store.ownerEmail,
    amountInArs: 0,
  });
  logEvent({ event: "admin.store.granted.pro", storeId });
  refreshDirectory();
  revalidatePath(`/admin/stores/${storeId}`);
  redirect(`/admin/stores/${storeId}`);
}

export async function revokePlan(formData: FormData): Promise<void> {
  await requireSuperadminSession();
  const storeId = parseStoreId(formData);

  if (storeId === null) {
    return;
  }

  const active = await database
    .select({ id: subscriptions.id, preapprovalId: subscriptions.mercadoPagoPreapprovalId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.storeId, storeId),
        inArray(subscriptions.status, ["authorized", "paused"]),
      ),
    );

  if (isPaymentsEnabled()) {
    for (const subscription of active) {
      if (subscription.preapprovalId !== null) {
        await cancelPreapproval(subscription.preapprovalId);
      }
    }
  }

  await database
    .update(subscriptions)
    .set({ status: "cancelled", accessEndsAt: null })
    .where(
      and(
        eq(subscriptions.storeId, storeId),
        inArray(subscriptions.status, ["authorized", "paused"]),
      ),
    );
  logEvent({ event: "admin.store.revoked.plan", storeId });
  refreshDirectory();
  revalidatePath(`/admin/stores/${storeId}`);
  redirect(`/admin/stores/${storeId}`);
}

export async function updateAdminStore(
  _previousState: UpdateAdminStoreState,
  formData: FormData,
): Promise<UpdateAdminStoreState> {
  await requireSuperadminSession();

  const parsed = updateStoreSchema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return { error: "Revisá el nombre y la descripción." };
  }

  const store = await findStore(parsed.data.storeId);

  if (store === undefined) {
    return { error: "Tienda no encontrada." };
  }

  await database
    .update(stores)
    .set({
      name: parsed.data.name,
      description: parsed.data.description === "" ? null : parsed.data.description,
    })
    .where(eq(stores.id, parsed.data.storeId));
  logEvent({ event: "admin.store.updated", storeId: parsed.data.storeId });
  invalidateStore(store.handle);
  revalidatePath(`/admin/stores/${parsed.data.storeId}`);
  redirect(`/admin/stores/${parsed.data.storeId}`);
}
