import { NextRequest, NextResponse } from 'next/server';
// Direct import of prisma client (server action safe)
import { prisma } from '@/../../prisma/client';
import { getSession } from '@/lib/session';
import { z } from 'zod';

// 페이지당 표시할 트윗 수
const TWEETS_PER_PAGE = 10;

// Next.js 15 표준 타입 명시 (파라미터 없는 경우에도 명시적으로 타입 선언)
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
    const totalTweets = await prisma.tweet.count();
    const totalPages = Math.ceil(totalTweets / TWEETS_PER_PAGE);
    
    // 마지막 페이지 확인
    const isLastPage = page >= totalPages;
    
    // 트윗 조회 (최신순, 사용자 정보 포함)
    const tweets = await prisma.tweet.findMany({
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

// 트윗 생성 스키마
const tweetSchema = z.object({
  tweet: z.string()
    .min(1, { message: '트윗 내용을 입력해주세요.' })
    .max(280, { message: '트윗은 최대 280자까지 입력 가능합니다.' })
});

// 트윗 생성 API
export async function POST(request: NextRequest) {
  try {
    // 로그인 확인
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    
    // 유효성 검사
    const validationResult = tweetSchema.safeParse(body);
    if (!validationResult.success) {
      const error = validationResult.error.errors[0];
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // 트윗 생성
    const tweet = await prisma.tweet.create({
      data: {
        tweet: validationResult.data.tweet,
        userId: session.userId
      }
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      tweet,
      message: '트윗이 성공적으로 작성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tweet:', error);
    return NextResponse.json(
      { error: '트윗 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
