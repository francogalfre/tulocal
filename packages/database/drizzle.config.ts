import { defineConfig } from "drizzle-kit";

import { databaseEnvironment } from "@tulocal/environment/database";

export default defineConfig({
  schema: "./src/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseEnvironment.DATABASE_URL,
  },
});
