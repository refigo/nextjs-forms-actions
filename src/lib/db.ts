import { PrismaClient } from "@prisma/client";

// This is the approach that ensures Prisma works in all environments including Vercel
function getClient() {
  // In production, it's best to create a new instance
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }
  
  // In development, we'll use a global variable to prevent connection issues
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  
  return global.prisma;
}

// Initialize the client immediately
const prismaClient = getClient();

// Export in multiple ways for compatibility with existing code
export const db = prismaClient;
export const prisma = prismaClient;
export default prismaClient;
