import { PrismaClient } from '../generated/prisma';

// This is to prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
};

// Use a global variable to prevent multiple instances during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create and export the database client
export const db = globalForPrisma.prisma ?? prismaClientSingleton();

// Set the global variable in development to prevent recreating on hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
