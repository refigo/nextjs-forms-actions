'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createResponseAction, ResponseFormState } from '@/app/actions/tweets';
import Button from '@/components/Button';

// 제출 버튼 컴포넌트
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="py-2 px-4">
      {pending ? '답글 작성 중...' : '답글 작성'}
    </Button>
  );
}

interface AddResponseProps {
  tweetId: string;
  onSuccess?: (response: any) => void;
  onOptimisticResponse?: (text: string) => void;
}

export default function AddResponse({ tweetId, onSuccess, onOptimisticResponse }: AddResponseProps) {
  // 초기 상태 설정
  const initialState: ResponseFormState = {
    success: false,
    message: '',
    error: '',
    text: ''
  };
  
  // useActionState 훅을 사용하여 폼 상태 관리
  const [state, formAction] = useActionState(createResponseAction, initialState);
  
  // 로컬 상태로 텍스트 입력값 관리
  const [responseText, setResponseText] = useState('');
  const [charCount, setCharCount] = useState(0);
  
  // 서버 액션 성공 시 입력값 초기화 및 콜백 호출
  useEffect(() => {
    if (state.success) {
      setResponseText('');
      setCharCount(0);
      if (onSuccess) {
        onSuccess(state);
      }
    } else if (state.text) {
      // 유효성 검사 실패 시 서버에서 전달한 값으로 복원
      setResponseText(state.text);
      setCharCount(state.text.length);
    }
  }, [state.success, state.text, onSuccess]);
  
  // 텍스트 입력 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setResponseText(value);
    setCharCount(value.length);
  };

  // 폼 제출 핸들러 - 서버 액션에 현재 입력값 전달
  const handleSubmit = (formData: FormData) => {
    formData.set('text', responseText);
    formData.set('tweetId', tweetId);
    
    // 낙관적 응답 업데이트를 위한 콜백 호출
    if (onOptimisticResponse) {
      onOptimisticResponse(responseText);
    }
    
    return formAction(formData);
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">답글 작성하기</h3>
      
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
            name="text"
            placeholder="답글을 입력하세요..."
            className="w-full border border-gray-300 rounded-lg p-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            maxLength={280}
            onChange={handleTextChange}
            value={responseText}
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
