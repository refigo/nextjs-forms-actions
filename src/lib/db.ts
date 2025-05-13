// 이 파일은 prisma-singleton.ts를 사용하도록 리다이렉트합니다
// Next.js 15.3.2에서는 일관된 Prisma 클라이언트 초기화 방식이 중요합니다

// prisma-singleton.ts에서 초기화된 클라이언트를 가져옵니다
import { prisma as prismaInstance } from './prisma-singleton';

// Export in multiple ways for compatibility with existing code
export const db = prismaInstance;
export const prisma = prismaInstance;
export default prismaInstance;
