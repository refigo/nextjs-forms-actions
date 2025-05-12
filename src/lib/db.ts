// Import Prisma client from our singleton implementation
import { prisma } from './prisma';

// Export the singleton instance
export const db = prisma;
