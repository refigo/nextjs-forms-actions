import { cookies } from 'next/headers';

export interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  username?: string;
  email?: string;
}

const SESSION_OPTIONS = {
  cookieName: 'nextjs_forms_actions_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
  },
};

// Since we're not using real iron-session in this implementation,
// we're using a simplified version that just stores the session data in a cookie
export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_OPTIONS.cookieName);

  if (!sessionCookie?.value) {
    return { isLoggedIn: false };
  }

  try {
    // In a real implementation with iron-session, this would be decrypted properly
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value)) as SessionData;
    return sessionData;
  } catch (error) {
    console.error('Error parsing session:', error);
    return { isLoggedIn: false };
  }
}

export async function setSession(data: SessionData): Promise<void> {
  // In a real implementation with iron-session, this would be encrypted properly
  const encodedData = encodeURIComponent(JSON.stringify(data));
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_OPTIONS.cookieName, encodedData, SESSION_OPTIONS.cookieOptions);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_OPTIONS.cookieName, '', {
    ...SESSION_OPTIONS.cookieOptions,
    maxAge: 0,
  });
}
