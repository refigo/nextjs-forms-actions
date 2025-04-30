'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react'; // Next.js 15.3에서 변경된 API
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

export default function AddTweet() {
  // 초기 상태 설정
  const initialState: TweetFormState = {
    success: false,
    message: '',
    error: '',
    tweet: ''
  };
  
  // useActionState 훅을 사용하여 폼 상태 관리 (Next.js 15.3에서 변경됨)
  const [state, formAction] = useActionState(createTweetAction, initialState);
  
  // 로컬 상태로 텍스트 입력값 관리
  const [tweetText, setTweetText] = useState('');
  const [charCount, setCharCount] = useState(0);
  
  // 서버 액션 성공 시 입력값 초기화
  useEffect(() => {
    if (state.success) {
      setTweetText('');
      setCharCount(0);
    } else if (state.tweet) {
      // 유효성 검사 실패 시 서버에서 전달한 값으로 복원
      setTweetText(state.tweet);
      setCharCount(state.tweet.length);
    }
  }, [state.success, state.tweet]);
  
  // 텍스트 입력 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTweetText(value);
    setCharCount(value.length);
  };

  // 폼 제출 핸들러 - 서버 액션에 현재 입력값 전달
  const handleSubmit = (formData: FormData) => {
    formData.set('tweet', tweetText);
    return formAction(formData);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 트윗 작성</h2>
      
      <form action={handleSubmit}>
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
            value={tweetText}
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
