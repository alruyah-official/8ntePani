// ---------------------------------------------------------------------------
// Prisma Client Singleton — Next.js Dev-Mode Safe (Prisma v7 / adapter-pg)
//
// Prisma v7 requires a driver adapter to be passed to PrismaClient.
// We use @prisma/adapter-pg which wraps the `pg` (node-postgres) pool.
//
// The singleton pattern prevents connection pool exhaustion during Next.js
// hot-reload in development: we store the single PrismaClient instance on
// `globalThis` (which is NOT cleared on HMR) and reuse it across requests.
//
// Usage in Server Components / Route Handlers:
//   import { db } from "@/lib/db";
//   const users = await db.user.findMany();
//
// ⚠️  DATABASE_URL must be set in .env.local before making any DB calls.
//     Without it the Pool constructor will fail at runtime (not at build time).
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  // PrismaPg uses the DATABASE_URL env var automatically if no connectionString
  // is passed explicitly, mirroring how prisma.config.ts supplies it to the CLI.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Global type so TypeScript knows about the cached instance
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
