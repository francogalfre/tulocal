import { publicProcedure, router } from "../index";
import { conversationRouter } from "./conversation";
import { productRouter } from "./product";
import { publicRouter } from "./public";
import { storeRouter } from "./store";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  store: storeRouter,
  product: productRouter,
  public: publicRouter,
  conversation: conversationRouter,
});

export type AppRouter = typeof appRouter;
