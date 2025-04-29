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

    // params 객체 await 처리
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
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
          select: { likes: true }
        }
      }
    });

    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tweet });
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweet' },
      { status: 500 }
    );
  }
}
