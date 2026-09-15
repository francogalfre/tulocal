import { TRPCError } from "@trpc/server";
import { product, store } from "@tulocal/db/schema/index";
import { and, eq } from "drizzle-orm";

import type { Context } from "../context";

type AuthedContext = Context & { session: NonNullable<Context["session"]> };

export async function findOwnedStore(ctx: AuthedContext) {
  return ctx.db.query.store.findFirst({ where: eq(store.ownerId, ctx.session.user.id) });
}

export async function getOwnedStore(ctx: AuthedContext) {
  const found = await findOwnedStore(ctx);
  if (!found) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Todavía no creaste tu tienda" });
  }
  return found;
}

export async function getOwnedProduct(ctx: AuthedContext, productId: string) {
  const ownedStore = await getOwnedStore(ctx);
  const found = await ctx.db.query.product.findFirst({
    where: and(eq(product.id, productId), eq(product.storeId, ownedStore.id)),
  });
  if (!found) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Producto no encontrado" });
  }
  return { store: ownedStore, product: found };
}

export function slugify(name: string) {
  const base = name
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "tienda"}-${suffix}`;
}
