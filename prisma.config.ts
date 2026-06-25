// prisma.config.ts
// Prisma v7 configuration file — the datasource URL and CLI settings live here.
// The schema file (prisma/schema.prisma) only defines data models and generators.
// Docs: https://pris.ly/d/config-datasource

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
