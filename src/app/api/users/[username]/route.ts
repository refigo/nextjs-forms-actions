import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 사용자 정보 가져오기 (비밀번호 제외)
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자의 트윗 가져오기
    const tweets = await db.tweet.findMany({
      where: {
        userId: user.id
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

    // 총 트윗 수 계산
    const totalTweets = await db.tweet.count({
      where: {
        userId: user.id
      }
    });

    return NextResponse.json({
      user,
      tweets,
      totalTweets,
      page,
      limit
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
