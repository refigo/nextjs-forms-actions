'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { FireIcon } from '@/components/Icons';

interface SessionStatus {
  isLoggedIn: boolean;
  username?: string;
}

export default function Home() {
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Error checking session:', error);
        setSession({ isLoggedIn: false });
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <FireIcon />
          <h1 className="text-3xl font-bold mt-4 text-gray-800">Next.js 인증 시스템</h1>
          <p className="mt-2 text-gray-600">
            Zod, Server Actions, Middleware, Tailwind, Prisma, iron-session을 활용한 인증 시스템 예제
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="animate-pulse flex flex-col space-y-4">
              <div className="h-12 bg-gray-200 rounded-full"></div>
              <div className="h-12 bg-gray-200 rounded-full"></div>
            </div>
          ) : session?.isLoggedIn ? (
            <>
              <div className="text-center mb-4">
                <p className="text-lg text-gray-800">
                  환영합니다, <span className="font-bold">{session.username}</span>님!
                </p>
              </div>
              <Link href="/profile" className="w-full">
                <Button className="w-full">프로필 보기</Button>
              </Link>
              <Link href="/api/auth/logout" className="w-full">
                <Button className="w-full bg-red-500 hover:bg-red-600">로그아웃</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/log-in" className="w-full">
                <Button className="w-full">로그인</Button>
              </Link>
              <Link href="/create-account" className="w-full">
                <Button className="w-full bg-indigo-500 hover:bg-indigo-600">계정 만들기</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
