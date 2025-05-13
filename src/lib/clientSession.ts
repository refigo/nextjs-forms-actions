// 클라이언트 환경에서 사용할 세션 관리 유틸리티

export interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  username?: string;
  email?: string;
}

const SESSION_OPTIONS = {
  cookieName: 'nextjs_forms_actions_session',
};

// 쿠키에서 값 가져오기 (클라이언트 측)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  
  if (!cookie) {
    return null;
  }
  
  return cookie.split('=')[1];
}

// 클라이언트에서 세션 정보 가져오기
export function getClientSession(): SessionData {
  try {
    const sessionCookie = getCookie(SESSION_OPTIONS.cookieName);
    
    if (!sessionCookie) {
      return { isLoggedIn: false };
    }
    
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie)) as SessionData;
    return sessionData;
  } catch (error) {
    console.error('Error parsing session:', error);
    return { isLoggedIn: false };
  }
}

// API를 통해 현재 세션 정보 가져오기
export async function fetchSession(): Promise<SessionData> {
  try {
    const response = await fetch('/api/session');
    if (!response.ok) {
      return { isLoggedIn: false };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching session:', error);
    return { isLoggedIn: false };
  }
}
