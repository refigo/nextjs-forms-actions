'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { logoutAction } from '../actions/auth';
import { db } from '@/lib/db';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('프로필을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/log-in');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
          <div className="animate-pulse">
            <div className="h-32 w-32 mx-auto rounded-full bg-gray-200"></div>
            <div className="h-6 bg-gray-200 rounded mt-4 mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 mx-auto w-1/2"></div>
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h1>
            <p className="text-gray-600">{error}</p>
            <div className="mt-6">
              <Button onClick={() => router.push('/log-in')}>로그인 페이지로 돌아가기</Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">사용자 정보를 찾을 수 없습니다</h1>
            <div className="mt-6">
              <Button onClick={() => router.push('/log-in')}>로그인 페이지로 돌아가기</Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mt-4">{user.username}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">자기소개</h2>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-md">
            {user.bio || '자기소개가 없습니다.'}
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">계정 정보</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">가입일</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">최근 업데이트</span>
              <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
          <Button 
            className="bg-gray-500 hover:bg-gray-600 flex-1"
            onClick={() => router.push('/')}
          >
            홈으로
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 flex-1"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </main>
  );
}
