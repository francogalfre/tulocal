import { TRPCError } from "@trpc/server";
import { conversation, product, productImage } from "@tulocal/db/schema/index";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { runPriceResearch, runProductPipeline } from "../lib/pipeline";
import { getOwnedProduct, getOwnedStore } from "../lib/store";

const optionalInt = z.number().int().nonnegative().nullable().optional();

export const productRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const store = await getOwnedStore(ctx);
    const products = await ctx.db.query.product.findMany({
      where: eq(product.storeId, store.id),
      orderBy: desc(product.createdAt),
      with: { images: true },
    });
    return products.map(({ images, ...item }) => {
      const cover =
        images.find((image) => image.id === item.coverImageId) ??
        images.find((image) => image.kind === "original");
      return { ...item, coverUrl: cover?.url ?? null, imageCount: images.length };
    });
  }),

  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const { product: item, store } = await getOwnedProduct(ctx, input.id);
    const images = await ctx.db.query.productImage.findMany({
      where: eq(productImage.productId, item.id),
      orderBy: [asc(productImage.sortOrder), asc(productImage.createdAt)],
    });
    const [conversations] = await ctx.db
      .select({ value: count() })
      .from(conversation)
      .where(eq(conversation.productId, item.id));
    return { ...item, images, store, conversationCount: conversations?.value ?? 0 };
  }),

  create: protectedProcedure
    .input(
      z.object({
        originalUrls: z.array(z.string().url()).min(1).max(8),
        hint: z.string().trim().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await getOwnedStore(ctx);
      const [created] = await ctx.db
        .insert(product)
        .values({ storeId: store.id, hint: input.hint || null, pipelineStage: "uploading" })
        .returning();
      await ctx.db.insert(productImage).values(
        input.originalUrls.map((url, index) => ({
          productId: created!.id,
          url,
          kind: "original" as const,
          fidelityPassed: null,
          sortOrder: index,
        })),
      );
      return { id: created!.id };
    }),

  runPipeline: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.id);
      await runProductPipeline({ db: ctx.db, productId: item.id, env: ctx.env });
      return ctx.db.query.product.findFirst({ where: eq(product.id, item.id) });
    }),

  refreshPrices: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.id);
      try {
        return await runPriceResearch({ db: ctx.db, productId: item.id, env: ctx.env });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "No se pudieron buscar precios",
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().max(4000).optional(),
        condition: z.enum(["new", "used"]).optional(),
        qualityPercent: z.number().int().min(0).max(100).nullable().optional(),
        listPrice: optionalInt,
        minPrice: optionalInt,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.id);
      const { id: _id, ...values } = input;
      if (
        values.listPrice != null &&
        values.minPrice != null &&
        values.minPrice > values.listPrice
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El precio mínimo no puede superar el precio de lista",
        });
      }
      const [updated] = await ctx.db
        .update(product)
        .set(values)
        .where(eq(product.id, item.id))
        .returning();
      return updated!;
    }),

  setImage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        imageId: z.string(),
        visible: z.boolean().optional(),
        cover: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.id);
      const image = await ctx.db.query.productImage.findFirst({
        where: and(eq(productImage.id, input.imageId), eq(productImage.productId, item.id)),
      });
      if (!image) throw new TRPCError({ code: "NOT_FOUND", message: "Imagen no encontrada" });
      if (input.visible !== undefined) {
        await ctx.db
          .update(productImage)
          .set({ visible: input.visible })
          .where(eq(productImage.id, image.id));
      }
      if (input.cover) {
        await ctx.db.update(product).set({ coverImageId: image.id }).where(eq(product.id, item.id));
      }
      return { ok: true };
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.string(), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.id);
      if (input.published) {
        const images = await ctx.db.query.productImage.findMany({
          where: and(eq(productImage.productId, item.id), eq(productImage.visible, true)),
        });
        if (!item.listPrice) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Definí un precio antes de publicar",
          });
        }
        if (!item.title) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El producto necesita un título" });
        }
        if (images.filter((image) => image.fidelityPassed !== false).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Necesitás al menos una imagen visible",
          });
        }
      }
      const step = (item.listPrice ?? 0) >= 100_000 ? 1000 : 100;
      const minPrice =
        item.minPrice ?? (item.listPrice ? Math.round((item.listPrice * 0.8) / step) * step : null);
      const [updated] = await ctx.db
        .update(product)
        .set({ published: input.published, minPrice })
        .where(eq(product.id, item.id))
        .returning();
      return updated!;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { product: item } = await getOwnedProduct(ctx, input.id);
      await ctx.db.delete(product).where(eq(product.id, item.id));
      return { ok: true };
    }),
});
