import { PrismaClient } from '@prisma/client'

// 안전한 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// 수정된 싱글톤 패턴 구현
// 전역에 경유하는 싱글톤 인스턴스
export const prisma = global.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })

// 개발 환경에서만 global 객체에 경유
// 이렇게 하면 핫리로딩 시 여러 인스턴스가 생성되는 것을 방지
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// 동적 초기화 함수 - 이전 코드와의 호환성을 위해 유지
export async function getPrismaClient(): Promise<PrismaClient> {
  return prisma;
}
