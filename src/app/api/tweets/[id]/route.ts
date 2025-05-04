import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
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
    console.log('API 요청 받음:', params);
    
    // params 객체 await 처리
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    console.log('트윗 ID:', id);
    
    // 트윗 조회 (사용자 정보 포함)
    const tweet = await db.tweet.findUnique({
      where: { id },
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
      console.log('트윗을 찾을 수 없음:', id);
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      );
    }

    console.log('트윗 찾음:', tweet);

    // 현재 사용자가 좋아요를 눌렀는지 확인
    const like = await db.like.findUnique({
      where: {
        userId_tweetId: {
          userId: session.userId!,
          tweetId: id
        }
      }
    });

    // 트윗에 대한 답글 조회
    const responses = await db.response.findMany({
      where: {
        tweetId: id
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
