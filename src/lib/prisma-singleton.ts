import { PrismaClient } from '@prisma/client'

// 전역 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma 클라이언트 초기화 함수
function prismaClientSingleton() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
}

// 전역 변수 정의 - 이 방식이 Next.js 15.x와 가장 호환성이 좋음
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 싱글톤 인스턴스 접근 (지연 초기화)
export const prisma = globalForPrisma.prisma ?? (
  globalForPrisma.prisma = prismaClientSingleton()
)

// 모듈 외부에서 export하지 않음 - Next.js 최적화에 도움
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
