import { NextResponse, type NextRequest } from 'next/server';

// Since we're working with a mock implementation (without actual iron-session/edge),
// this middleware uses a simplified check for authentication status
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('nextjs_forms_actions_session');
  const isLoggedIn = sessionCookie ? true : false; // In a real app, we would verify this cookie properly

  // Protected routes - redirect to login if not authenticated
  if ((pathname === '/' || pathname.startsWith('/profile') || pathname.startsWith('/tweets')) && !isLoggedIn) {
    const url = new URL('/log-in', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Authentication routes - redirect to profile if already authenticated
  if ((pathname.startsWith('/log-in') || pathname.startsWith('/create-account')) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Specify which routes the middleware should run on
export const config = {
  matcher: ['/', '/profile/:path*', '/tweets/:path*', '/log-in', '/create-account'],
};
