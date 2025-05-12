import { PrismaClient } from '@prisma/client'

// 전역 타입 선언 - TypeScript에게 global 객체의 확장을 알림
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// PrismaClient 인스턴스 생성
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
}

// 싱글톤 인스턴스 생성 또는 기존 인스턴스 재사용
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// export 문을 모든 로직 앞에 배치
export const prisma = globalForPrisma.prisma || prismaClientSingleton()

// 개발 환경에서만 전역 객체에 할당 (Hot Reload 최적화)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
