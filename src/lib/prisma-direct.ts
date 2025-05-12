import { PrismaClient } from '@prisma/client'

// 직접 호출마다 PrismaClient 인스턴스 생성
// Edge 환경과 호환되는 패턴
export function getPrismaClient() {
  return new PrismaClient()
}
