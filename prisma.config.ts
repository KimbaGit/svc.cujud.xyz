// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DIRECT_URL"),        // ← Pakai DIRECT_URL untuk migrations
    // shadowDatabaseUrl: env("DIRECT_URL"), // optional, jika butuh shadow db
  },

  migrations: {
    path: "prisma/migrations",
  },
});