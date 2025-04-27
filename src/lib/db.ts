import { PrismaClient } from '@prisma/client';

// This is to prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a mock PrismaClient if the real one is not available
const createMockPrismaClient = () => {
  console.warn('Using mock Prisma client. Please run "prisma generate" for the real client.');
  
  // Return a minimal mock that prevents runtime errors
  return {
    user: {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => ({ id: 'mock-id', createdAt: new Date(), updatedAt: new Date() }),
      update: async () => ({}),
      delete: async () => ({}),
    },
    // Add other models as needed
    $connect: async () => {},
    $disconnect: async () => {},
  } as unknown as PrismaClient;
};

// Try to initialize PrismaClient, fall back to mock if it fails
let prismaClient: PrismaClient;
try {
  prismaClient = globalThis.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prismaClient;
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  prismaClient = createMockPrismaClient();
}

export const db = prismaClient;
