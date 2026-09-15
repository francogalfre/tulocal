import { TRPCError } from "@trpc/server";
import { store } from "@tulocal/db/schema/index";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import {
  HANDLE_FORMAT_MESSAGE,
  HANDLE_MAX_LENGTH,
  HANDLE_MIN_LENGTH,
  HANDLE_PATTERN,
} from "../lib/handle";
import { findOwnedStore, isHandleTaken } from "../lib/store";

export const HANDLE_TAKEN_MESSAGE = "ese handle ya está usado";

const phoneSchema = z
  .string()
  .transform((value) => value.replaceAll(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "usá formato internacional, ej: +54 9 11 5555 1234"));

const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(HANDLE_MIN_LENGTH)
  .max(HANDLE_MAX_LENGTH)
  .regex(HANDLE_PATTERN, HANDLE_FORMAT_MESSAGE);

export const storeRouter = router({
  getMine: protectedProcedure.query(async ({ ctx }) => (await findOwnedStore(ctx)) ?? null),

  isHandleAvailable: protectedProcedure
    .input(z.object({ handle: handleSchema }))
    .query(async ({ ctx, input }) => ({ available: !(await isHandleTaken(ctx, input.handle)) })),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(60),
        handle: handleSchema,
        whatsappPhone: phoneSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (await findOwnedStore(ctx)) {
        throw new TRPCError({ code: "CONFLICT", message: "ya tenés una tienda" });
      }
      if (await isHandleTaken(ctx, input.handle)) {
        throw new TRPCError({ code: "CONFLICT", message: HANDLE_TAKEN_MESSAGE });
      }
      const [created] = await ctx.db
        .insert(store)
        .values({
          name: input.name,
          slug: input.handle,
          whatsappPhone: input.whatsappPhone,
          ownerId: ctx.session.user.id,
        })
        .returning();
      return created!;
    }),
});
