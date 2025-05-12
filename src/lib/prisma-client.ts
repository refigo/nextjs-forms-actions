// Re-export from db.ts to maintain compatibility with existing imports
export * from './db';

// Also export the default export
import prismaClient from './db';
export default prismaClient;
