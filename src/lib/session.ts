import { cookies } from 'next/headers';

export interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  username?: string;
  email?: string;
  // user 객체 추가 (기존 코드와의 호환성을 위해)
  user?: {
    id: string;
    username: string;
    email: string;
  };
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
    
    // 세션 데이터의 구조가 바뀌었을 경우를 대비해 변환 처리
    // 이전 형식: user 객체 내부에 사용자 정보가 있음
    if (sessionData.user) {
      return sessionData;
    }
    // 새 형식: session 객체에 직접 사용자 정보가 있음 (이 경우 두 형식 모두 유지)
    else if (sessionData.isLoggedIn && sessionData.userId) {
      sessionData.user = {
        id: sessionData.userId,
        username: sessionData.username || '',
        email: sessionData.email || ''
      };
      return sessionData;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Error parsing session:', error);
    return { isLoggedIn: false };
  }
}

export async function setSession(data: SessionData): Promise<void> {
  // 두 형식을 모두 지원하도록 세션 데이터 완성
  const sessionData: SessionData = { ...data };
  
  // user 속성이 있는지 확인
  if (sessionData.user && sessionData.user.id) {
    // user 속성이 있다면 기본 속성도 설정
    sessionData.isLoggedIn = true;
    sessionData.userId = sessionData.user.id;
    sessionData.username = sessionData.user.username;
    sessionData.email = sessionData.user.email;
  } 
  // user 속성이 없지만 기본 속성이 있는 경우
  else if (sessionData.isLoggedIn && sessionData.userId) {
    // user 속성 생성
    sessionData.user = {
      id: sessionData.userId,
      username: sessionData.username || '',
      email: sessionData.email || ''
    };
  }
  
  // In a real implementation with iron-session, this would be encrypted properly
  const encodedData = encodeURIComponent(JSON.stringify(sessionData));
  
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
