import { PrismaClient } from '@prisma/client'

// PrismaClient 인터페이스를 확장하여 필요한 경우 추가 기능 확장 가능
interface CustomPrismaClient extends PrismaClient {
  // 여기에 필요한 경우 커스텀 메서드 추가
}

// 전역 타입 선언 - TypeScript에게 global 객체의 확장을 알림
declare global {
  // eslint-disable-next-line no-var
  var prisma: CustomPrismaClient | undefined
}

// 싱글톤 인스턴스 생성 또는 기존 인스턴스 재사용
export const prisma = global.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  }) as CustomPrismaClient

// 개발 환경에서만 전역 객체에 할당 (Hot Reload 최적화)
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
