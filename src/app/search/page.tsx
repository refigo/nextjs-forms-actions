'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TweetCard, { TweetWithUser } from '@/components/TweetCard';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface SearchResults {
  tweets: TweetWithUser[];
  totalCount: number;
  page: number;
  limit: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1');

  // 상태 정의
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 검색 실행 함수
  const executeSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=10`);
      
      if (!res.ok) {
        throw new Error('검색 중 오류가 발생했습니다.');
      }
      
      const data = await res.json();
      setSearchResults(data);
      
      // URL 업데이트 (검색어와 페이지 반영)
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      params.set('page', page.toString());
      router.push(`/search?${params.toString()}`);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 양식 제출 처리
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    executeSearch(query, 1);
  };

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    executeSearch(query, newPage);
    window.scrollTo(0, 0);
  };

  // 초기 로드 시 URL에 검색어가 있으면 검색 실행
  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, initialPage);
    }
  }, []);

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    if (!searchResults || searchResults.totalCount === 0) return null;
    
    const totalPages = Math.ceil(searchResults.totalCount / searchResults.limit);
    
    return (
      <div className="flex justify-center mt-6 gap-2">
        {currentPage > 1 && (
          <Button 
            onClick={() => handlePageChange(currentPage - 1)}
            className="!w-auto py-2 px-4"
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
            className="!w-auto py-2 px-4"
          >
            다음
          </Button>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">트윗 검색</h1>
        </div>
      
      {/* 검색 폼 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 flex overflow-hidden">
          {/* 검색 아이콘 */}
          <div className="px-3 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          {/* 검색 입력창 - Input 컴포넌트에서 바깥쪽 div 제거 */}
          <input
            name="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="flex-1 py-3 px-2 border-none outline-none text-gray-600"
          />
          
          {/* 검색 버튼 */}
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="m-0 rounded-none rounded-r-lg !w-auto whitespace-nowrap min-w-[80px] flex-shrink-0"
          >
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </form>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* 검색 결과 */}
      <div>
        {searchResults?.tweets && searchResults.tweets.length > 0 ? (
          <>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
              <p>총 <strong>{searchResults.totalCount}</strong>개의 결과를 찾았습니다.</p>
            </div>
            <div className="space-y-4">
              {searchResults.tweets.map((tweet) => (
                <div key={tweet.id}>
                  <TweetCard tweet={tweet} />
                </div>
              ))}
            </div>
            <div className="mt-6 mb-4">
              <Pagination />
            </div>
          </>
        ) : searchResults && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  </main>
  );
}
