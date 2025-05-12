'use client';

import { useState } from 'react';
import Button from '@/components/Button';

interface AddTweetDirectProps {
  onTweetCreated?: () => void; // 새 트윗 작성 시 호출될 콜백 함수
}

export default function AddTweetDirect({ onTweetCreated }: AddTweetDirectProps) {
  // 로컬 상태 관리
  const [tweetText, setTweetText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // 텍스트 입력 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTweetText(value);
    setCharCount(value.length);
    
    // 에러/성공 메시지 초기화
    if (error || success) {
      setError('');
      setSuccess(false);
      setMessage('');
    }
  };

  // 폼 제출 핸들러 - 직접 API 호출
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 기본 폼 제출 동작 방지
    e.preventDefault();
    
    console.log('폼 제출 핸들러 시작');
    
    // 상태가 이미 제출중이라면 중복 제출 방지
    if (isSubmitting) {
      console.log('이미 제출 중이므로 무시');
      return;
    }
    
    // 유효성 검사
    if (!tweetText.trim()) {
      setError('트윗 내용을 입력해주세요.');
      return;
    }
    
    if (tweetText.length > 280) {
      setError('트윗은 최대 280자까지 입력 가능합니다.');
      return;
    }
    
    try {
      // 제출 상태 설정
      setIsSubmitting(true);
      setError('');
      setSuccess(false);
      
      console.log('트윗 전송 시작:', tweetText);
      
      // API 직접 호출
      console.log('트윗 API 호출 시작');
      
      // 대기 상태 안내 표시
      setMessage('트윗을 서버에 전송 중...');
      
      // API 호출
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweet: tweetText }),
        // 캐시 방지 설정
        cache: 'no-store'
      });
      
      console.log('트윗 API 응답 받음:', response.status, response.statusText);
      
      // 응답 받는 과정에서 문제 발생하면 오류 처리
      if (!response.ok) {
        const errorText = await response.text();
        console.error('트윗 API 오류 응답:', errorText);
        throw new Error(`API 호출 오류: ${response.status} ${response.statusText}`);
      }
      
      // 성공적인 응답 받아서 처리
      const data = await response.json();
      console.log('트윗 API 응답 데이터:', data);
      
      // 성공 처리
      console.log('트윗 작성 성공!', data);
      setSuccess(true);
      setMessage('트윗이 성공적으로 작성되었습니다.');
      
      // 입력값 초기화
      setTweetText('');
      setCharCount(0);
      
      // 성공 콜백 호출
      if (onTweetCreated) {
        console.log('트윗 생성 성공, 콜백 호출');
        
        // setTimeout을 사용하여 상태 업데이트 후 콜백 호출
        setTimeout(() => {
          onTweetCreated();
        }, 0);
      }
    } catch (err) {
      console.error('트윗 작성 오류:', err);
      setError(err instanceof Error ? err.message : '트윗 작성에 실패했습니다.');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 트윗 작성</h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {message}
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
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="py-2 px-4"
          >
            {isSubmitting ? '트윗 작성 중...' : '트윗 작성'}
          </Button>
        </div>
      </form>
    </div>
  );
}
