import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    // 세션 데이터 가져오기
    const sessionData = await getSession();
    console.log('[API] 세션 데이터:', JSON.stringify(sessionData, null, 2));
    
    // 로그인 상태 디버깅 출력
    console.log('[API] 세션 값:', sessionData?.isLoggedIn ? '로그인됨' : '로그아웃됨', 
              'userId:', sessionData?.userId || 'none',
              'username:', sessionData?.username || 'none');
              
    // user 객체도 출력
    if (sessionData.user) {
      console.log('[API] user 객체:', sessionData.user);
    }
    
    // user 객체가 있는 경우
    if (sessionData.user) {
      console.log('[API] user 객체가 있는 형식의 세션');
      return NextResponse.json({
        isLoggedIn: true,
        userId: sessionData.user.id,
        username: sessionData.user.username,
        email: sessionData.user.email,
        // 우선순위를 확실하게 하기 위해 user 속성도 전달
        user: sessionData.user
      });
    }
    // userId만 있는 경우
    else if (sessionData.isLoggedIn && sessionData.userId) {
      console.log('[API] 기본 형식의 세션');
      return NextResponse.json({
        isLoggedIn: true,
        userId: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email
      });
    } 
    // 로그인되지 않은 경우
    else {
      console.log('[API] 로그인 안됨');
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error('[API] Error fetching session:', error);
    return NextResponse.json({ isLoggedIn: false }, { status: 500 });
  }
}
