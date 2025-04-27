import { NextResponse } from 'next/server';
import { logout } from '@/lib/session';

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
