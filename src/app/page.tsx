'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TweetCard, { TweetWithUser } from '@/components/TweetCard';
import TweetForm from '@/components/TweetForm';
import Button from '@/components/Button';
import { FireIcon } from '@/components/Icons';

// 페이지네이션 정보 인터페이스
interface PaginationInfo {
  page: number;
  totalPages: number;
  isLastPage: boolean;
  totalTweets: number;
}

export default function Home() {
  const [tweets, setTweets] = useState<TweetWithUser[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    isLastPage: true,
    totalTweets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  // 트윗 데이터 가져오기
  const fetchTweets = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tweets?page=${page}`);
      
      if (!response.ok) {
        throw new Error('트윗을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setTweets(data.tweets);
      setPagination(data.pagination);
    } catch (error) {
      console.error('트윗 로딩 오류:', error);
      setError('트윗을 불러오는데 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.isLoggedIn && data.username) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('사용자 정보 로딩 오류:', error);
    }
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (!pagination.isLastPage) {
      fetchTweets(pagination.page + 1);
    }
  };

  // 이전 페이지로 이동
  const goToPrevPage = () => {
    if (pagination.page > 1) {
      fetchTweets(pagination.page - 1);
    }
  };

  useEffect(() => {
    fetchTweets(1);
    fetchUserInfo();
  }, []);

  if (loading && tweets.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">트윗 목록</h1>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <FireIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => fetchTweets(1)}>다시 시도</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">트윗 목록</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              안녕하세요, <span className="font-semibold">{username}</span>님!
            </p>
            <Link href="/profile">
              <Button className="py-2 px-4">프로필</Button>
            </Link>
          </div>
        </div>

        {/* 트윗 작성 폼 */}
        <TweetForm />

        {tweets.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">아직 트윗이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-8 flex justify-between items-center">
              <Button 
                onClick={goToPrevPage} 
                disabled={pagination.page <= 1}
                className={pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                ← 이전
              </Button>
              
              <div className="text-gray-600">
                페이지 {pagination.page} / {pagination.totalPages || 1}
              </div>
              
              <Button 
                onClick={goToNextPage} 
                disabled={pagination.isLastPage}
                className={pagination.isLastPage ? 'opacity-50 cursor-not-allowed' : ''}
              >
                다음 →
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
