import { PrismaClient } from '@prisma/client'

// 안전한 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma 객체 초기 선언
let prisma: PrismaClient

// 동적 초기화 함수 - 이 함수를 각 API 라우트에서 호출
export async function getPrismaClient(): Promise<PrismaClient> {
  if (prisma) {
    return prisma
  }
  
  if (global.prisma) {
    return global.prisma
  }
  
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
  
  // 초기화 확인 로그 (디버깅용)
  console.log('Prisma Client has been initialized')
  
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
  }
  
  return prisma
}
