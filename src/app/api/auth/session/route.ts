import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    
    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      username: session.username,
      email: session.email
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { 
        isLoggedIn: false,
        error: 'Failed to get session'
      },
      { status: 500 }
    );
  }
}
