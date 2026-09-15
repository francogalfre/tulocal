import { TRPCError } from "@trpc/server";
import { product, productImage, store } from "@tulocal/db/schema/index";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { publicImages, publicProduct, publicStore } from "../lib/public";

export const publicRouter = router({
  storeBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.store.findFirst({ where: eq(store.slug, input.slug) });
      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Tienda no encontrada" });
      const products = await ctx.db.query.product.findMany({
        where: and(eq(product.storeId, found.id), eq(product.published, true)),
        orderBy: desc(product.createdAt),
        with: { images: true },
      });
      return {
        store: publicStore(found),
        products: products.map(({ images, ...item }) => ({
          id: item.id,
          title: item.title ?? "Producto",
          listPrice: item.listPrice,
          condition: item.condition,
          qualityPercent: item.qualityPercent,
          coverUrl: publicImages(item, images)[0]?.url ?? null,
        })),
      };
    }),

  productById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const item = await ctx.db.query.product.findFirst({
      where: and(eq(product.id, input.id), eq(product.published, true)),
      with: { store: true },
    });
    if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Producto no encontrado" });
    const images = await ctx.db.query.productImage.findMany({
      where: eq(productImage.productId, item.id),
      orderBy: [asc(productImage.sortOrder), asc(productImage.createdAt)],
    });
    const { store: owner, ...rest } = item;
    return { product: publicProduct(rest, images), store: publicStore(owner) };
  }),
});
