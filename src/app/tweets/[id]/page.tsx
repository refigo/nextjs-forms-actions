'use client';

import { useEffect, useState, useOptimistic } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Button from '@/components/Button';
import { TweetWithUser } from '@/components/TweetCard';
import AddResponse from '@/components/AddResponse';
import ResponseCard, { ResponseWithUser } from '@/components/ResponseCard';
import { likeTweetAction } from '@/app/actions/tweets';

// 트윗 상태 인터페이스
interface TweetState extends TweetWithUser {
  isLiked: boolean;
  _count: {
    likes: number;
    responses: number;
  };
}

export default function TweetDetailPage() {
  const params = useParams();
  const tweetId = params.id as string;

  const router = useRouter();
  const [tweet, setTweet] = useState<TweetState | null>(null);
  const [responses, setResponses] = useState<ResponseWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 낙관적 UI 업데이트를 위한 optimistic 상태 설정
  const [optimisticTweet, updateOptimisticTweet] = useOptimistic(
    tweet,
    (state, newState: Partial<TweetState>) => {
      if (!state) return state;
      return { ...state, ...newState };
    }
  );

  const [optimisticResponses, updateOptimisticResponses] = useOptimistic(
    responses,
    (state, newResponse: ResponseWithUser) => {
      return [newResponse, ...state];
    }
  );

  // 트윗 및 답글 불러오기
  useEffect(() => {
    async function fetchTweetAndResponses() {
      try {
        setLoading(true);
        const response = await fetch(`/api/tweets/${tweetId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('트윗을 찾을 수 없습니다.');
          }
          throw new Error('트윗을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setTweet({
          ...data.tweet,
          isLiked: data.isLiked || false,
          _count: data._count || { likes: 0, responses: 0 }
        });
        setResponses(data.responses || []);
      } catch (error) {
        console.error('트윗 로딩 오류:', error);
        setError(error instanceof Error ? error.message : '트윗을 불러오는데 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTweetAndResponses();
  }, [tweetId]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = async () => {
    if (!tweet) return;

    // 낙관적 UI 업데이트
    const isCurrentlyLiked = tweet.isLiked;
    updateOptimisticTweet({
      isLiked: !isCurrentlyLiked,
      _count: {
        ...tweet._count,
        likes: isCurrentlyLiked ? tweet._count.likes - 1 : tweet._count.likes + 1
      }
    });

    // 서버 액션 호출
    try {
      const result = await likeTweetAction(tweetId);
      if (!result.success) {
        // 서버 액션 실패 시 원래 상태로 복원
        updateOptimisticTweet({
          isLiked: isCurrentlyLiked,
          _count: {
            ...tweet._count,
            likes: isCurrentlyLiked ? tweet._count.likes : tweet._count.likes
          }
        });
        console.error('좋아요 처리 오류:', result.error);
      }
    } catch (error) {
      // 에러 발생 시 원래 상태로 복원
      updateOptimisticTweet({
        isLiked: isCurrentlyLiked,
        _count: {
          ...tweet._count,
          likes: isCurrentlyLiked ? tweet._count.likes : tweet._count.likes
        }
      });
      console.error('좋아요 처리 중 오류 발생:', error);
    }
  };

  // 새 답글 추가 성공 핸들러
  const handleResponseSuccess = () => {
    // 페이지 새로고침하여 최신 답글 목록 가져오기
    // 실제로는 revalidatePath가 서버 액션에서 처리됨
  };

  // 새 답글 낙관적 업데이트
  const handleOptimisticResponse = (text: string) => {
    if (!tweet) return;

    const now = new Date();
    const optimisticResponse: ResponseWithUser = {
      id: `temp-${Date.now()}`,
      text,
      createdAt: now,
      user: {
        id: 'current-user', // 실제 사용자 ID는 서버에서 설정됨
        username: 'You' // 실제 사용자명은 서버에서 설정됨
      }
    };

    updateOptimisticResponses(optimisticResponse);
    
    // 트윗의 답글 카운트도 업데이트
    if (tweet) {
      updateOptimisticTweet({
        _count: {
          ...tweet._count,
          responses: tweet._count.responses + 1
        }
      });
    }
  };

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

  if (!optimisticTweet) {
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
            <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
          </div>
        </div>
      </main>
    );
  }

  const createdAt = new Date(optimisticTweet.createdAt);
  
  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: ko 
  });

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
              {optimisticTweet.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{optimisticTweet.user.username}</h2>
              <p className="text-gray-500">{timeAgo}</p>
            </div>
          </div>
          
          <p className="text-gray-800 text-lg mb-4 whitespace-pre-wrap">{optimisticTweet.tweet}</p>
          
          <div className="flex items-center text-gray-500 border-t border-gray-100 pt-4">
            <button 
              onClick={handleLikeToggle}
              className={`flex items-center mr-4 ${optimisticTweet.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <span className="mr-1">{optimisticTweet.isLiked ? '❤️' : '🤍'}</span>
              <span>{optimisticTweet._count.likes}</span>
            </button>
            <span className="flex items-center">
              <span className="mr-1">💬</span>
              <span>{optimisticTweet._count.responses}</span>
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
          
          {optimisticResponses.length === 0 ? (
            <p className="text-gray-500 text-center py-4 mt-4">아직 답글이 없습니다.</p>
          ) : (
            <div className="mt-6 space-y-2">
              {optimisticResponses.map((response) => (
                <ResponseCard key={response.id} response={response} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
