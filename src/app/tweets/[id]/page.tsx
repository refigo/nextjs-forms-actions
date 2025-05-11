'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Button from '@/components/Button';
// import { TweetWithUser } from '@/components/TweetCard';
import AddResponse from '@/components/AddResponse';
import ResponseCard, { ResponseWithUser } from '@/components/ResponseCard';
import { likeTweetAction } from '@/app/actions/tweets';

// 트윗 상태 인터페이스
interface TweetState {
  id: string;
  tweet: string;
  createdAt: Date | string;
  user: {
    id: string;
    username: string;
  };
  _count?: {
    likes: number;
    responses: number;
  };
}

export default function TweetDetailPage() {
  // 라우트 파라미터를 가져옵니다
  const params = useParams();
  const tweetId = params.id as string;
  const router = useRouter();
  
  // 컴포넌트 상태
  const [tweet, setTweet] = useState<TweetState | null>(null);
  const [responses, setResponses] = useState<ResponseWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 좋아요 로컬 상태
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  
  // 디버깅용 상태 추가
  const [apiData, setApiData] = useState<Record<string, unknown>>({});
  
  // 마운트된 상태를 추적하는 ref
  const isMountedRef = useRef(true);
  
  // 데이터 로딩 함수를 정의합니다
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      // 로딩 상태 시작
      setLoading(true);
      
      console.log('트윗 데이터 가져오기 시작:', tweetId);
      
      // API에서 트윗 데이터를 가져옵니다
      const response = await fetch(`/api/tweets/${tweetId}`);
      
      if (!isMountedRef.current) return;
      
      // 응답 상태 확인
      if (!response.ok) {
        throw new Error(
          response.status === 404 
            ? '트윗을 찾을 수 없습니다.' 
            : '트윗을 불러오는데 실패했습니다.'
        );
      }
      
      // 응답 데이터 파싱
      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      // 디버깅용 원본 데이터 저장
      setApiData(data);
      
      if (!isMountedRef.current) return;
      
      // 데이터가 없을 경우 에러
      if (!data || !data.tweet) {
        throw new Error('트윗 데이터가 없습니다.');
      }
      
      // 데이터 상태 업데이트
      setTweet(data.tweet);
      setResponses(Array.isArray(data.responses) ? data.responses : []);
      setIsLiked(!!data.isLiked);
      
      // 좋아요 및 응답 카운트 설정
      if (data.tweet._count) {
        setLikeCount(Number(data.tweet._count.likes) || 0);
        setResponseCount(Number(data.tweet._count.responses) || 0);
      } else {
        setLikeCount(0);
        setResponseCount(0);
      }
      
      // 에러 상태 초기화
      setError('');
      console.log('트윗 데이터 로딩 완료');
    } catch (error) {
      // 에러 처리
      console.error('트윗 로딩 오류:', error);
      setError(error instanceof Error ? error.message : '트윗을 불러오는데 문제가 발생했습니다.');
    } finally {
      // 로딩 상태 종료
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [tweetId]);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('컴포넌트 마운트, 데이터 가져오기 시작');
    fetchData();
    
    // 컴포넌트 언마운트 시 클린업
    return () => {
      console.log('컴포넌트 언마운트');
      isMountedRef.current = false;
    };
  }, [fetchData]);
  
  // 좋아요 토글 핸들러
  const handleLikeToggle = async () => {
    if (!tweet) return;
    
    // 현재 상태 저장
    const currentLiked = isLiked;
    const currentCount = likeCount;
    
    // 낙관적 UI 업데이트
    setIsLiked(!currentLiked);
    setLikeCount(prev => currentLiked ? prev - 1 : prev + 1);
    
    try {
      // 서버 액션 호출
      console.log('좋아요 액션 호출');
      const result = await likeTweetAction(tweetId);
      console.log('좋아요 액션 결과:', result);
      
      if (!result.success) {
        // 서버 액션 실패 시 원래 상태로 복원
        setIsLiked(currentLiked);
        setLikeCount(currentCount);
        console.error('좋아요 처리 오류:', result.error);
      }
    } catch (error) {
      // 에러 발생 시 원래 상태로 복원
      setIsLiked(currentLiked);
      setLikeCount(currentCount);
      console.error('좋아요 처리 중 오류 발생:', error);
    }
  };
  
  // 새 답글 추가 핸들러
  const handleResponseSuccess = useCallback(() => {
    console.log('답글 추가 성공');
    
    // 데이터를 새로 불러올지 여부를 결정
    // fetchData(); // 필요한 경우 주석 해제
  }, []);
  
  // 낙관적 응답 업데이트 핸들러
  const handleOptimisticResponse = useCallback((text: string) => {
    if (!tweet) {
      console.log('트윗이 없어 낙관적 응답을 추가할 수 없습니다.');
      return;
    }
    
    console.log('낙관적 응답 추가:', text);
    
    const now = new Date();
    const optimisticResponse: ResponseWithUser = {
      id: `temp-${Date.now()}`,
      text,
      createdAt: now,
      user: {
        id: tweet.user.id,
        username: tweet.user.username
      }
    };
    
    // 낙관적으로 UI 업데이트
    setResponses(prev => [optimisticResponse, ...prev]);
    setResponseCount(prev => prev + 1);
  }, [tweet]);
  
  // 디버깅 정보 출력
  console.log('렌더링 상태:', { loading, error, tweet: !!tweet, responseCount, apiData });
  
  // 로딩 상태 표시
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.back()} 
              className="text-gray-600 hover:text-gray-900"
            >
              ← 뒤로 가기
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 bg-white animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  // 에러 상태 표시
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.back()} 
              className="text-gray-600 hover:text-gray-900"
            >
              ← 뒤로 가기
            </button>
          </div>
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
          </div>
        </div>
      </main>
    );
  }
  
  // 트윗이 없는 경우
  if (!tweet) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.back()} 
              className="text-gray-600 hover:text-gray-900"
            >
              ← 뒤로 가기
            </button>
          </div>
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">트윗을 찾을 수 없습니다</h1>
            <p className="text-gray-500 mb-6">디버깅 정보: {JSON.stringify({ params, apiData })}</p>
            <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
          </div>
        </div>
      </main>
    );
  }
  
  // 날짜 형식 처리 - 문자열이나 Date 객체 모두 처리 가능하도록
  let createdAt: Date;
  try {
    createdAt = tweet.createdAt instanceof Date 
      ? tweet.createdAt 
      : new Date(tweet.createdAt);
  } catch (e) {
    console.error('날짜 변환 오류:', e);
    createdAt = new Date();
  }
    
  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: ko 
  });
  
  // 정상 트윗 표시
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="text-gray-600 hover:text-gray-900"
          >
            ← 뒤로 가기
          </button>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            홈으로
          </Link>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6 bg-white mb-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold mr-4">
              {tweet.user?.username ? tweet.user.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tweet.user?.username || '알 수 없는 사용자'}</h2>
              <p className="text-gray-500">{timeAgo}</p>
            </div>
          </div>
          
          <p className="text-gray-800 text-lg mb-4 whitespace-pre-wrap">{tweet.tweet}</p>
          
          <div className="flex items-center text-gray-500 border-t border-gray-100 pt-4">
            <button 
              onClick={handleLikeToggle}
              className={`flex items-center mr-4 ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <span className="mr-1">{isLiked ? '❤️' : '🤍'}</span>
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center">
              <span className="mr-1">💬</span>
              <span>{responseCount}</span>
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">답글</h3>
          
          <AddResponse 
            tweetId={tweetId} 
            onSuccess={handleResponseSuccess}
            onOptimisticResponse={handleOptimisticResponse}
          />
          
          {responses.length === 0 ? (
            <p className="text-gray-500 text-center py-4 mt-4">아직 답글이 없습니다.</p>
          ) : (
            <div className="mt-6 space-y-2">
              {responses.map((response) => (
                <ResponseCard key={response.id} response={response} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
