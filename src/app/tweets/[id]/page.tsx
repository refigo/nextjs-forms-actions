'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Button from '@/components/Button';
import { TweetWithUser } from '@/components/TweetCard';

interface TweetDetailProps {
  params: {
    id: string;
  };
}

export default function TweetDetailPage({ params }: TweetDetailProps) {
  const router = useRouter();
  const [tweet, setTweet] = useState<TweetWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTweet() {
      try {
        setLoading(true);
        const response = await fetch(`/api/tweets/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('트윗을 찾을 수 없습니다.');
          }
          throw new Error('트윗을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setTweet(data.tweet);
      } catch (error) {
        console.error('트윗 로딩 오류:', error);
        setError(error instanceof Error ? error.message : '트윗을 불러오는데 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTweet();
  }, [params.id]);

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
            <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
          </div>
        </div>
      </main>
    );
  }

  // 날짜 형식이 문자열인 경우 Date 객체로 변환
  const createdAt = new Date(tweet.createdAt);
  
  // 얼마나 전에 작성되었는지 표시 (예: "3시간 전", "2일 전")
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
              {tweet.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tweet.user.username}</h2>
              <p className="text-gray-500">{timeAgo}</p>
            </div>
          </div>
          
          <p className="text-gray-800 text-lg mb-4 whitespace-pre-wrap">{tweet.tweet}</p>
          
          <div className="flex items-center text-gray-500 border-t border-gray-100 pt-4">
            <span className="flex items-center">
              <span className="mr-1">❤️</span>
              <span>{tweet._count.likes}</span>
            </span>
          </div>
        </div>
        
        {/* 추후 답글 기능을 위한 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">답글</h3>
          <p className="text-gray-500 text-center py-4">아직 답글이 없습니다.</p>
        </div>
      </div>
    </main>
  );
}
