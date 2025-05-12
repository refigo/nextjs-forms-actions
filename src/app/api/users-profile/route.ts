// Direct import of prisma client (server action safe)
import { prisma } from '@/../../prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// 사용자명으로 프로필 조회 API - ?username=xxx 형식으로 변경
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 사용자명이 없는 경우
    if (!username) {
      return NextResponse.json(
        { error: '사용자명이 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 가져오기 (비밀번호 제외)
    const user = await prisma.user.findUnique({
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
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자의 트윗 가져오기
    const tweets = await prisma.tweet.findMany({
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
    const totalTweets = await prisma.tweet.count({
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
    return NextResponse.json(
      { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
