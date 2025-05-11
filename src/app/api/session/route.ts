import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const sessionData = await getSession();
    
    // 서버의 세션 데이터가 클라이언트에서 기대하는 형식으로 반환
    // 클라이언트는 isLoggedIn, userId, username, email을 바로 사용
    if (sessionData.isLoggedIn) {
      return NextResponse.json({
        isLoggedIn: true,
        userId: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email
      });
    } else {
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ isLoggedIn: false }, { status: 500 });
  }
}
