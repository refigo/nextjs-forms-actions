'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import TweetCard, { TweetWithUser } from '@/components/TweetCard';
import Button from '@/components/Button';
import { fetchSession } from '@/lib/clientSession';

interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: string | Date;
}

interface UserProfileData {
  user: User;
  tweets: TweetWithUser[];
  totalTweets: number;
  page: number;
  limit: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const page = parseInt(searchParams.get('page') || '1');

  // 상태 관리
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);

  // 유저 데이터 로드
  const loadUserData = async (username: string, page: number = 1) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${username}?page=${page}&limit=10`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }
        throw new Error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
      
      const data = await res.json();
      setProfileData(data);

      // 현재 로그인한 사용자와 프로필 사용자가 동일한지 확인
      checkIfCurrentUser(data.user.id);
      
      // URL 업데이트 (페이지 번호)
      if (page !== 1) {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        router.push(`/users/${username}?${params.toString()}`);
      }
    } catch (err) {
      console.error('Profile load error:', err);
      setError(err instanceof Error ? err.message : '사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 현재 로그인한 사용자인지 확인
  const checkIfCurrentUser = async (profileUserId: string) => {
    try {
      const session = await fetchSession();
      if (session && session.isLoggedIn && session.userId === profileUserId) {
        setIsCurrentUser(true);
      } else {
        setIsCurrentUser(false);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setIsCurrentUser(false);
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadUserData(username, newPage);
    window.scrollTo(0, 0);
  };

  // 초기 로드 시 사용자 정보 가져오기
  useEffect(() => {
    if (username) {
      loadUserData(username, page);
    }
  }, [username]);

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    if (!profileData || profileData.totalTweets === 0) return null;
    
    const totalPages = Math.ceil(profileData.totalTweets / profileData.limit);
    
    return (
      <div className="flex justify-center mt-6 gap-2">
        {currentPage > 1 && (
          <Button 
            onClick={() => handlePageChange(currentPage - 1)}
            className="py-2 px-4"
          >
            이전
          </Button>
        )}
        
        <span className="py-2 px-4 border border-gray-300 rounded">
          {currentPage} / {totalPages}
        </span>
        
        {currentPage < totalPages && (
          <Button 
            onClick={() => handlePageChange(currentPage + 1)}
            className="py-2 px-4"
          >
            다음
          </Button>
        )}
      </div>
    );
  };

  // 로딩 중 상태
  if (loading && !profileData) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">사용자 프로필</h1>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <Button onClick={() => router.push('/')} className="py-2 px-4 !w-auto">
            홈으로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // 데이터가 없는 경우
  if (!profileData) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">사용자를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">사용자 정보를 불러올 수 없습니다.</p>
          <Button onClick={() => router.push('/')} className="py-2 px-4 !w-auto">
            홈으로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  const { user, tweets } = profileData;
  const createdAt = new Date(user.createdAt);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{user.username}의 프로필</h1>
          {isCurrentUser && (
            <Link href={`/users/${username}/edit`} className="text-blue-500 hover:underline py-2 px-4 border border-blue-300 rounded-lg bg-blue-50">
              프로필 수정
            </Link>
          )}
        </div>
        
        {/* 프로필 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1 text-gray-800">{user.username}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              
              {user.bio ? (
                <p className="text-gray-800 mb-2">{user.bio}</p>
              ) : (
                <p className="text-gray-500 italic mb-2">자기소개가 없습니다.</p>
              )}
              
              <p className="text-sm text-gray-500">
                가입일: {formatDistanceToNow(createdAt, { addSuffix: true, locale: ko })}
              </p>
            </div>
          </div>
        </div>
        
        {/* 트윗 목록 */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">작성한 트윗 ({profileData.totalTweets})</h2>
        </div>
        
        {tweets.length > 0 ? (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
            <div className="mt-6">
              <Pagination />
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">작성한 트윗이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
