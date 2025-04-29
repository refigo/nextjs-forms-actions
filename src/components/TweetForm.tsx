'use client';

import { useState } from 'react';
import { useActionState } from 'react'; // Next.js 15.3에서는 react에서 임포트합니다
import { useFormStatus } from 'react-dom';
import { createTweetAction, TweetFormState } from '@/app/actions/tweets';
import Button from '@/components/Button';

// 제출 버튼 컴포넌트
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="py-2 px-4">
      {pending ? '트윗 작성 중...' : '트윗 작성'}
    </Button>
  );
}

export default function TweetForm() {
  // 초기 상태 설정
  const initialState: TweetFormState = {
    success: false,
    message: '',
    error: '',
    tweet: ''
  };
  
  // useActionState 훅을 사용하여 폼 상태 관리
  const [state, formAction] = useActionState(createTweetAction, initialState);
  
  // 글자 수 카운팅을 위한 상태
  const [charCount, setCharCount] = useState(0);
  
  // 텍스트 입력 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 트윗 작성</h2>
      
      <form action={formAction}>
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {state.error}
          </div>
        )}
        
        {state.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {state.message}
          </div>
        )}
        
        <div className="mb-4">
          <textarea
            name="tweet"
            placeholder="무슨 일이 일어나고 있나요?"
            className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            maxLength={280}
            onChange={handleTextChange}
            required
          />
          <div className="flex justify-end mt-2">
            <span className={`text-sm ${charCount > 260 ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount}/280
            </span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
