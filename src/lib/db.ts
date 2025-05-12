// 비동기 초기화 패턴을 사용하는 Prisma 클라이언트 가져오기
import { getPrismaClient } from '@/lib/prisma-client';

// 비동기 getDb 함수 추가 - 기존 코드와의 호환성을 위해
export async function getDb() {
  return await getPrismaClient();
}

// 기존 코드의 호환성을 위해 db 객체 자체를 노출하지 않고 필요한 경우 getDb()를 사용하도록 수정
export const db = {
  // 비동기 함수를 통해 Prisma 객체에 접근
  // 사용 예시: const client = await db.getClient();
  getClient: async () => await getPrismaClient(),
  
  // 자주 사용되는 모델들에 대한 편의 메서드
  user: {
    findUnique: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.user.findUnique(args);
    },
    findMany: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.user.findMany(args);
    },
    create: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.user.create(args);
    },
    update: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.user.update(args);
    }
  },
  tweet: {
    findUnique: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.tweet.findUnique(args);
    },
    findMany: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.tweet.findMany(args);
    },
    create: async (args: any) => {
      const prisma = await getPrismaClient();
      return prisma.tweet.create(args);
    }
  }
};
