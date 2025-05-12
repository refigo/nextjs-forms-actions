import { PrismaClient } from "@prisma/client";

// 노마드코더 방식의 Prisma 클라이언트 인스턴스 생성
const prismaClient = new PrismaClient();

// 기존 코드와의 호환성을 위해 named export 제공
export const db = prismaClient;
export const prisma = prismaClient;

// 기본 export도 유지
export default prismaClient;
