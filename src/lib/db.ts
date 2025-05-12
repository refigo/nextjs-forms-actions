// 단순한 Prisma 클라이언트 파일 사용
import { prisma } from '@/lib/prisma-client';

// 데이터베이스 엑세스를 위한 단순한 익스포트
export { prisma };

// 기존 코드와의 호환성을 위한 db 객체
export const db = prisma;
