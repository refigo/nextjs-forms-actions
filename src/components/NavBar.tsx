'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/clientSession';

type SessionData = {
  isLoggedIn: boolean;
  userId?: string;
  username?: string;
  email?: string;
};

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 세션 로드 함수 - API를 통해 서버에서 세션 정보 가져오기
  const loadSession = async () => {
    try {
      // API를 통해 세션 정보 가져오기 (더 정확한 세션 정보)
      const sessionData = await fetchSession();
      console.log('NavBar: 세션 로드 성공', sessionData);
      setSession(sessionData);
    } catch (error) {
      console.error('NavBar: 세션 로드 오류:', error);
      // 오류 발생 시 비로그인 상태로 설정
      setSession({ isLoggedIn: false });
    }
  };
  
  // 페이지 로드되면 즉시 세션 정보 로드
  useEffect(() => {
    loadSession();
    
    // 10초마다 세션 정보 새로고침 (선택사항)
    const intervalId = setInterval(loadSession, 10000);
    
    return () => clearInterval(intervalId);
  }, []); // 컴포넌트 마운트 시에만 한 번 실행
  
  // 경로 변경 시에도 세션 정보 새로 로드
  useEffect(() => {
    loadSession();
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // 로그아웃 처리
  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      // 상태를 먼저 변경하여 UI에 즉시 반영
      setSession({ isLoggedIn: false });
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // 서버에 로그아웃 요청
      if (response.ok) {
        console.log('로그아웃 성공');
        
        // 홈으로 리디렉션
        router.push('/');
        
        // 페이지 완전 새로고침 (세션 상태 강제 반영을 위해)
        window.location.reload();
      } else {
        // 실패하면 세션 다시 가져오기
        loadSession();
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류 발생 시 세션 다시 가져오기
      loadSession();
    }
  };

  return (
    <nav className="bg-white shadow-md py-3 px-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        {/* 로고 및 기본 메뉴 */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-semibold text-pink-500">
            NextJS Twitter
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link 
              href="/" 
              className={`hover:text-pink-500 transition-colors ${
                pathname === '/' ? 'text-pink-500 font-medium' : 'text-gray-600'
              }`}
            >
              홈
            </Link>
            <Link 
              href="/search" 
              className={`hover:text-pink-500 transition-colors ${
                pathname === '/search' ? 'text-pink-500 font-medium' : 'text-gray-600'
              }`}
            >
              검색
            </Link>
          </div>
        </div>

        {/* 사용자 메뉴 */}
        <div className="hidden md:flex items-center space-x-4">
          {session?.isLoggedIn ? (
            <>
              <Link 
                href={`/users/${session.username}`}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                내 프로필
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/log-in" 
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                로그인
              </Link>
              <Link 
                href="/create-account" 
                className="px-4 py-2 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-gray-500 hover:text-pink-500 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 px-6 mt-2 space-y-3 border-t border-gray-100">
          <Link 
            href="/" 
            className={`block py-2 ${
              pathname === '/' ? 'text-pink-500 font-medium' : 'text-gray-600'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            홈
          </Link>
          <Link 
            href="/search" 
            className={`block py-2 ${
              pathname === '/search' ? 'text-pink-500 font-medium' : 'text-gray-600'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            검색
          </Link>
          
          {session?.isLoggedIn ? (
            <>
              <Link 
                href={`/users/${session.username}`}
                className="block py-2 text-gray-600 hover:text-pink-500"
                onClick={() => setIsMenuOpen(false)}
              >
                내 프로필
              </Link>
              <button
                className="block py-2 text-gray-600 w-full text-left hover:text-pink-500"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleLogout(e);
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/log-in" 
                className="block py-2 text-gray-600 hover:text-pink-500"
                onClick={() => setIsMenuOpen(false)}
              >
                로그인
              </Link>
              <Link 
                href="/create-account" 
                className="block py-2 text-gray-600 hover:text-pink-500"
                onClick={() => setIsMenuOpen(false)}
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
