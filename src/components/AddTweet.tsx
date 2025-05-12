'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react'; // Next.js 15.3에서 변경된 API
import { useFormStatus } from 'react-dom';
import { createTweetAction, TweetFormState } from '@/app/actions/tweets';
import Button from '@/components/Button';
import React from 'react';  // useRef와 디버깅을 위해 추가

// 제출 버튼 컴포넌트
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="py-2 px-4">
      {pending ? '트윗 작성 중...' : '트윗 작성'}
    </Button>
  );
}

interface AddTweetProps {
  onTweetCreated?: () => void; // 새 트윗 작성 시 호출될 콜백 함수
}

export default function AddTweet({ onTweetCreated }: AddTweetProps) {
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
  
  // 이전 state 값을 저장하기 위한 ref
  const prevStateRef = React.useRef({ success: false });
  
  // 서버 액션 성공 시 입력값 초기화 및 콜백 호출
  useEffect(() => {
    console.log('서버 액션 상태 변경:', 
              '이전=', prevStateRef.current.success, 
              '현재=', state.success);
    
    // success 상태가 false에서 true로 변경되었을 것을 확인
    if (state.success && !prevStateRef.current.success) {
      console.log('트윗 생성 성공!');
      
      // 입력필드 초기화
      setTweetText('');
      setCharCount(0);
      
      // 트윗 생성 성공 시 onTweetCreated 콜백 호출
      if (onTweetCreated) {
        console.log('트윗 생성 성공, 콜백 호출');
        onTweetCreated();
      }
    } else if (state.tweet) {
      // 유효성 검사 실패 시 서버에서 전달한 값으로 복원
      setTweetText(state.tweet);
      setCharCount(state.tweet.length);
    }
    
    // 현재 상태를 이전 상태로 저장
    prevStateRef.current = { success: state.success };
  }, [state, onTweetCreated]);
  
  // 텍스트 입력 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTweetText(value);
    setCharCount(value.length);
  };

  // 폼 제출 핸들러 - 서버 액션에 현재 입력값 전달
  const handleSubmit = (formData: FormData) => {
    // formData에 트윗 내용 설정
    formData.set('tweet', tweetText);
    
    // 서버 액션 호출
    
    // 서버 액션 호출
    const result = formAction(formData);
    
    // 콘솔에 서버 액션 호출 로그
    console.log('트윗 제출 요청 완료');
    
    return result;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 트윗 작성</h2>
      
      <form action={handleSubmit} onSubmit={() => {
        console.log('폼 제출 시작');
      }}>
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
            className="text-black w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
