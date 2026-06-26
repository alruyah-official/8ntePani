// This file exports a shared PrismaClient instance.
// Importing from here (rather than creating new PrismaClient() in every file)
// ensures only ONE database connection pool is used across the whole app.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
