'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import TweetCard, { TweetWithUser } from '@/components/TweetCard';
import Button from '@/components/Button';
import { getSession } from '@/lib/session';

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
      const session = await getSession();
      if (session && session.user && session.user.id === profileUserId) {
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
      <div className="max-w-md mx-auto p-4 text-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/')} className="py-2 px-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!profileData) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>사용자 정보를 불러올 수 없습니다.</p>
        <Button onClick={() => router.push('/')} className="mt-4 py-2 px-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  const { user, tweets } = profileData;
  const createdAt = new Date(user.createdAt);

  return (
    <div className="max-w-md mx-auto p-4">
      {/* 프로필 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
          {isCurrentUser && (
            <Link href={`/users/${username}/edit`} className="text-blue-500 hover:underline">
              프로필 수정
            </Link>
          )}
        </div>
        
        <p className="text-gray-600 mb-2">{user.email}</p>
        
        {user.bio ? (
          <p className="mb-4">{user.bio}</p>
        ) : (
          <p className="text-gray-500 italic mb-4">자기소개가 없습니다.</p>
        )}
        
        <p className="text-sm text-gray-500">
          가입일: {formatDistanceToNow(createdAt, { addSuffix: true, locale: ko })}
        </p>
      </div>
      
      {/* 트윗 목록 */}
      <h2 className="text-xl font-semibold mb-4">작성한 트윗 ({profileData.totalTweets})</h2>
      
      {tweets.length > 0 ? (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
          <Pagination />
        </div>
      ) : (
        <p className="text-center py-8 bg-gray-50 rounded">작성한 트윗이 없습니다.</p>
      )}
    </div>
  );
}
