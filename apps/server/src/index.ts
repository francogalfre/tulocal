import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@tulocal/api/routers/index";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { createContext } from "./context";
import { env } from "./env";
import { chatRoute } from "./routes/chat";
import { uploadRoute } from "./routes/upload";
import { auth } from "./services";

const app = new Hono();

console.log("[tulocal] env:", {
  openrouter: env.OPENROUTER_API_KEY ? "ok" : "MISSING",
  tavily: env.TAVILY_API_KEY ? "ok" : "MISSING",
  blob: env.BLOB_READ_WRITE_TOKEN ? "ok" : "MISSING",
  appUrl: env.APP_URL,
});

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.route("/upload", uploadRoute);
app.route("/chat", chatRoute);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
