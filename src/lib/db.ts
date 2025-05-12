// 싱글톤 패턴의 Prisma 클라이언트 로드
import { prisma } from '@/lib/prisma-client';

// getDb 함수 - 기존 코드와의 호환성을 위해
export async function getDb() {
  return prisma;
}

// 기존 코드와의 호환성을 위해 동일한 인터페이스 유지
export const db = {
  // Prisma 객체에 직접 접근 (db.getClient() 호출시)
  getClient: async () => prisma,
  
  // 사용되는 모델들에 대한 인터페이스
  user: {
    findUnique: async (args: any) => prisma.user.findUnique(args),
    findMany: async (args: any) => prisma.user.findMany(args),
    findFirst: async (args: any) => prisma.user.findFirst(args),
    create: async (args: any) => prisma.user.create(args),
    update: async (args: any) => prisma.user.update(args),
    delete: async (args: any) => prisma.user.delete(args)
  },
  tweet: {
    findUnique: async (args: any) => prisma.tweet.findUnique(args),
    findMany: async (args: any) => prisma.tweet.findMany(args),
    create: async (args: any) => prisma.tweet.create(args),
    update: async (args: any) => prisma.tweet.update(args),
    delete: async (args: any) => prisma.tweet.delete(args)
  },
  // Like 모델
  like: {
    findUnique: async (args: any) => prisma.like.findUnique(args),
    findMany: async (args: any) => prisma.like.findMany(args),
    create: async (args: any) => prisma.like.create(args),
    delete: async (args: any) => prisma.like.delete(args)
  },
  // Response 모델
  response: {
    findUnique: async (args: any) => prisma.response.findUnique(args),
    findMany: async (args: any) => prisma.response.findMany(args),
    create: async (args: any) => prisma.response.create(args),
    update: async (args: any) => prisma.response.update(args),
    delete: async (args: any) => prisma.response.delete(args)
  }
};
