'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import TweetCard, { TweetWithUser } from '@/components/TweetCard';
// AddTweet 대신 AddTweetDirect 사용
import AddTweetDirect from '@/components/AddTweetDirect';
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
  
  // UI용 현재 페이지 상태 - 서버 응답과 관련 없이 순수하게 UI 상태만 관리
  const [currentPage, setCurrentPage] = useState(1);
  
  // 트윗 목록 갱신 플래그 - 공강 호출을 방지하기 위해 사용
  const [refreshFlag, setRefreshFlag] = useState(0);

  // 트윗 데이터 가져오기 - useCallback 사용하여 초기화 시에만 생성
  const fetchTweets = useCallback(async (page: number) => {
    console.log(`[페이지 ${page}] 트윗 가져오기 시작`);
    try {
      setLoading(true);
      const response = await fetch(`/api/tweets?page=${page}`);
      
      if (!response.ok) {
        throw new Error('트윗을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log(`[페이지 ${page}] 트윗 데이터 받음:`, data.tweets.length);
      
      setTweets(data.tweets);
      setPagination(prev => ({
        ...data.pagination,
        // 화면에 표시되는 페이지를 업데이트하지 않고 리스트만 갱신
        page: prev.page
      }));
    } catch (error) {
      console.error('트윗 로딩 오류:', error);
      setError('트윗을 불러오는데 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.isLoggedIn && data.username) {
        setUsername(data.username);
      }
    } catch (_error) {
      console.error('사용자 정보 로딩 오류:', _error);
    }
  };

  // 다음 페이지로 이동
  const _goToNextPage = () => {
    if (!pagination.isLastPage) {
      fetchTweets(pagination.page + 1);
    }
  };

  // 이전 페이지로 이동
  const _goToPrevPage = () => {
    if (pagination.page > 1) {
      fetchTweets(pagination.page - 1);
    }
  };

  // 페이지 변경 핸들러
  const goToPage = (pageNumber: number) => {
    console.log(`페이지 변경: ${pageNumber}`);
    setCurrentPage(pageNumber);
    // refreshFlag를 증가시켜 트윗 목록 갱신 유도
    setRefreshFlag(prev => prev + 1);
  };
  
  // 트윗 생성 후 호출될 함수
  const handleTweetCreated = useCallback(() => {
    console.log('트윗 생성됨, 목록 새로고침');
    // 항상 1페이지로 돌아감
    setCurrentPage(1);
    // refreshFlag를 증가시켜 목록 갱신
    setRefreshFlag(prev => prev + 1);
  }, []);

  // 페이지 로드 시 초기 데이터 로드
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // refreshFlag가 변경되거나 currentPage가 변경될 때만 트윗 가져오기
  useEffect(() => {
    fetchTweets(currentPage);
  }, [currentPage, refreshFlag, fetchTweets]);

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

        {/* 현재 로그인한 사용자인 경우에만 트윗 작성 폼 표시 */}
        {/* 트윗 작성 컴포넌트 (직접 API를 호출하는 버전 사용) */}
        {username && (
          <AddTweetDirect onTweetCreated={handleTweetCreated} />
        )}

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
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="py-2 px-4 !w-auto"
              >
                ← 이전
              </Button>
              
              <div className="text-gray-600 w-1/2 text-center">
                페이지 {currentPage} / {pagination.totalPages || 1}
              </div>
              
              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="py-2 px-4 !w-auto"
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
