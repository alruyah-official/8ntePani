import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Prisma Client Singleton — Next.js Dev-Mode Safe
// ---------------------------------------------------------------------------
// Problem: Next.js hot-reload clears the Node.js module cache on every change,
// which causes a new PrismaClient instance (and new DB connection pool) to be
// created on every request in development, quickly exhausting connections.
//
// Solution: Attach the single PrismaClient instance to `globalThis`, which is
// NOT cleared by hot-reload. In production the module cache is stable, so a
// direct export is used without touching globalThis.
//
// Usage:
//   import { db } from "@/lib/db";
//   const users = await db.user.findMany();
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
