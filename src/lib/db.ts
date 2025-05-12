// Import Prisma client from our project-level singleton
import { prisma } from '../../prisma/client';

// Export the singleton instance
export const db = prisma;
