'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// 트윗 데이터 인터페이스
export interface TweetWithUser {
  id: string;
  tweet: string;
  createdAt: string | Date;
  user: {
    id: string;
    username: string;
  };
  _count: {
    likes: number;
  };
}

// 트윗 카드 컴포넌트 props
interface TweetCardProps {
  tweet: TweetWithUser;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  // 날짜 형식이 문자열인 경우 Date 객체로 변환
  const createdAt = new Date(tweet.createdAt);
  
  // 얼마나 전에 작성되었는지 표시 (예: "3시간 전", "2일 전")
  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: ko 
  });

  return (
    <Link href={`/tweets/${tweet.id}`} className="block">
      <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold mr-3">
              {tweet.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{tweet.user.username}</p>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-500">
            <span className="text-sm">❤️ {tweet._count.likes}</span>
          </div>
        </div>
        <p className="text-gray-800 mt-2">{tweet.tweet}</p>
      </div>
    </Link>
  );
}
