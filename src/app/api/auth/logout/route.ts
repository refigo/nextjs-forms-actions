import { NextResponse } from 'next/server';
import { logout } from '@/lib/session';

// GET 방식은 유지 (기존 코드 호환성)
export async function GET() {
  try {
    await logout();
    return NextResponse.redirect(new URL('/log-in', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    );
  }
}

// POST 방식 추가 (NavBar에서 사용하는 요청 방식)
export async function POST() {
  try {
    console.log('[API] 로그아웃 요청 받음');
    await logout();
    
    // 좋은 응답 반환 (서버에서는 리다이렉트를 자동으로 처리하지 않음)
    return NextResponse.json({ success: true, isLoggedIn: false });
  } catch (error) {
    console.error('[API] Error logging out:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log out' },
      { status: 500 }
    );
  }
}
