import { store } from "@tulocal/db/schema/index";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { findOwnedStore, slugify } from "../lib/store";

const phoneSchema = z
  .string()
  .transform((value) => value.replaceAll(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Usá formato internacional, ej: +54 9 11 5555 1234"));

export const storeRouter = router({
  getMine: protectedProcedure.query(async ({ ctx }) => (await findOwnedStore(ctx)) ?? null),

  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(60),
        whatsappPhone: phoneSchema,
        description: z.string().trim().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await findOwnedStore(ctx);
      const values = {
        name: input.name,
        whatsappPhone: input.whatsappPhone,
        description: input.description ?? null,
      };
      if (existing) {
        const [updated] = await ctx.db
          .update(store)
          .set(values)
          .where(eq(store.id, existing.id))
          .returning();
        return updated!;
      }
      const [created] = await ctx.db
        .insert(store)
        .values({ ...values, ownerId: ctx.session.user.id, slug: slugify(input.name) })
        .returning();
      return created!;
    }),
});
