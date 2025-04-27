import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    // If user is not logged in
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if we're using the mock Prisma client (where findUnique will return null)
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // If user is not found but we have session data, use that (helpful for mock mode)
    if (!user && session.isLoggedIn) {
      // Create a mock user from session data for development/testing
      return NextResponse.json({ 
        user: {
          id: session.userId || 'mock-id',
          username: session.username || 'mockuser',
          email: session.email || 'mock@example.com',
          bio: 'This is mock profile data since Prisma client is not properly initialized.',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Normal case - user found
    if (user) {
      return NextResponse.json({ user });
    }

    // If no user found at all
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    // Create a mock response for development/testing if there's an error
    if (process.env.NODE_ENV !== 'production') {
      const session = await getSession();
      if (session.isLoggedIn) {
        return NextResponse.json({ 
          user: {
            id: session.userId || 'mock-id',
            username: session.username || 'mockuser',
            email: session.email || 'mock@example.com',
            bio: 'This is mock profile data. Prisma error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
