// Prisma v7 uses a driver adapter pattern instead of embedding the connection
// string inside PrismaClient directly. We create a pg Pool, wrap it in the
// Prisma pg adapter, then pass that adapter to PrismaClient.

import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

// One shared pg connection pool for the entire process lifetime
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
