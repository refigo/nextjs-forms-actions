// 비동기 초기화 패턴으로 변경
import { getPrismaClient } from '@/lib/prisma-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 유효한 검색어가 없으면 빈 결과 반환
    if (!query.trim()) {
      return NextResponse.json({
        tweets: [],
        totalCount: 0,
        page,
        limit
      });
    }

    // 비동기적으로 Prisma 클라이언트 초기화
    const prisma = await getPrismaClient();
    
    // 트윗 검색 쿼리 실행 (내용에 키워드 포함)
    const tweets = await prisma.tweet.findMany({
      where: {
        tweet: {
          contains: query
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            likes: true,
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // 전체 결과 수 계산
    const totalCount = await prisma.tweet.count({
      where: {
        tweet: {
          contains: query
        }
      }
    });

    return NextResponse.json({
      tweets,
      totalCount,
      page,
      limit
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
