'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// ResponseWithUser 타입 정의 
export interface ResponseWithUser {
  id: string;
  text: string;
  createdAt: string | Date;
  user: {
    id: string;
    username: string;
  };
}

interface ResponseCardProps {
  response: ResponseWithUser;
}

export default function ResponseCard({ response }: ResponseCardProps) {
  // 날짜 포맷팅
  const createdAt = new Date(response.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: ko 
  });

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold mr-3 flex-shrink-0">
          {response.user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline mb-1">
            <span className="font-semibold text-gray-900 mr-2">{response.user.username}</span>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{response.text}</p>
        </div>
      </div>
    </div>
  );
}
