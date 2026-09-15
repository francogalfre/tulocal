export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  /** Public origin of the web app (share links, WhatsApp summaries). */
  APP_URL: process.env.APP_URL ?? process.env.CORS_ORIGIN!,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY ?? "",
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ?? "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
};
