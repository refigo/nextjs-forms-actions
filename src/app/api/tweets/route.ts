import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

// 페이지당 표시할 트윗 수
const TWEETS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    // 로그인 확인
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // URL 쿼리 파라미터에서 페이지 번호 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    
    // 페이지 번호 유효성 검사
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }

    // 트윗 수 계산 (페이지네이션을 위함)
    const totalTweets = await db.tweet.count();
    const totalPages = Math.ceil(totalTweets / TWEETS_PER_PAGE);
    
    // 마지막 페이지 확인
    const isLastPage = page >= totalPages;
    
    // 트윗 조회 (최신순, 사용자 정보 포함)
    const tweets = await db.tweet.findMany({
      take: TWEETS_PER_PAGE,
      skip: (page - 1) * TWEETS_PER_PAGE,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    return NextResponse.json({
      tweets,
      pagination: {
        page,
        totalPages,
        isLastPage,
        totalTweets
      }
    });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}
