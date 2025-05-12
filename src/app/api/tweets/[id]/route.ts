import { NextRequest, NextResponse } from 'next/server';
// 비동기 초기화 패턴으로 변경
import { getPrismaClient } from '@/lib/prisma-client';
import { getSession } from '@/lib/session';

// Next.js 15에서는 API 라우트 핸들러 정의
export async function GET(request: NextRequest) {
  // URL에서 트윗 ID 추출
  const pathParts = request.url.split('/');
  const tweetId = pathParts[pathParts.length - 1] || '';
  try {
    // 로그인 확인
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 로깅 추가
    console.log('API 요청 받음, 트윗 ID:', tweetId);

    // ID가 없으면 오류 반환
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400 }
      );
    }
    
    // 비동기적으로 Prisma 클라이언트 초기화
    const prisma = await getPrismaClient();
    
    // 트윗 조회 (사용자 정보 포함)
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        },
        _count: {
          select: { 
            likes: true,
            responses: true
          }
        }
      }
    });

    if (!tweet) {
      console.log('트윗을 찾을 수 없음:', tweetId);
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      );
    }

    console.log('트윗 찾음:', tweet);

    // 현재 사용자가 좋아요를 눌렀는지 확인
    const like = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId: session.userId!,
          tweetId: tweetId
        }
      }
    });

    // 트윗에 대한 답글 조회
    const responses = await prisma.response.findMany({
      where: {
        tweetId: tweetId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('응답 개수:', responses.length);
    
    // 명확한 응답 구조
    const responseData = {
      tweet,
      isLiked: !!like,
      responses
    };
    
    console.log('응답 데이터 보냄');
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweet' },
      { status: 500 }
    );
  }
}
