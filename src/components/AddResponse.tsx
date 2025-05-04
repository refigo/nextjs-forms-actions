'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 제출 처리 완료 여부를 추적
  const successHandled = useRef(false);
  
  // 서버 액션 성공 시 처리
  useEffect(() => {
    // 이미 처리된 성공 응답은 다시 처리하지 않음
    if (state.success && !successHandled.current) {
      // 성공 처리를 했음을 표시
      successHandled.current = true;
      
      // 폼 초기화
      setResponseText('');
      setCharCount(0);
      setIsSubmitting(false);
      
      // 성공 콜백 호출 - 단 한 번만
      if (onSuccess) {
        // setTimeout을 사용하여 React 렌더링 사이클과 분리
        setTimeout(() => {
          onSuccess(state);
        }, 0);
      }
    } else if (state.error) {
      // 에러 발생 시 제출 상태 초기화
      successHandled.current = false;
      setIsSubmitting(false);
    }
  }, [state, onSuccess]);
  
  // 사용자 입력마다 성공 처리 플래그 초기화
  useEffect(() => {
    successHandled.current = false;
  }, [responseText]);
  
  // 텍스트 입력 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setResponseText(value);
    setCharCount(value.length);
  };

  // 폼 제출 핸들러
  const handleSubmit = (formData: FormData) => {
    // 입력값이 비어있거나 이미 제출 중이면 제출하지 않음
    if (!responseText.trim() || isSubmitting) return;
    
    // 낙관적 UI 업데이트 실행 (한 번만)
    if (onOptimisticResponse && !isSubmitting) {
      onOptimisticResponse(responseText);
      setIsSubmitting(true);
    }
    
    // 서버 액션에 데이터 전달
    formData.set('text', responseText);
    formData.set('tweetId', tweetId);
    
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
            disabled={isSubmitting}
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
