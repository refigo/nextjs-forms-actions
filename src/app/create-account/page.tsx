'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { signupAction, SignupFormState } from '../actions/auth';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { EmailIcon, UserIcon, LockIcon } from '@/components/Icons';
import FormContainer from '@/components/FormContainer';
import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '가입 중...' : '계정 만들기'}
    </Button>
  );
}

export default function CreateAccountPage() {
  const router = useRouter();
  
  // Define initial state
  const initialState: SignupFormState = {
    success: false,
    message: '',
    errors: {},
    values: {
      email: '',
      username: '',
      password: '',
      bio: ''
    }
  };

  const [state, formAction] = useActionState(signupAction, initialState);
  
  // 사용자 입력값을 관리하기 위한 상태 추가
  const [formValues, setFormValues] = useState({
    email: state.values?.email || '',
    username: state.values?.username || '',
    password: ''
  });
  
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    bio?: string;
  }>({});
  
  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Use useEffect for navigation after successful signup
  useEffect(() => {
    if (state.success) {
      router.push('/profile');
    }
  }, [state.success, router]);

  // Client-side validation handler
  const validateAndSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Reset client errors
    setClientErrors({});
    
    // 현재 상태의 값을 사용하여 유효성 검사
    const { email, username, password } = formValues;
    
    // Validate each field
    let hasErrors = false;
    const errors: {
      email?: string;
      username?: string;
      password?: string;
      bio?: string;
    } = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.';
      hasErrors = true;
    } else if (!email.trim().endsWith('@zod.com')) {
      errors.email = '오직 @zod.com 도메인의 이메일만 허용됩니다.';
      hasErrors = true;
    }
    
    // Username validation
    if (!username.trim()) {
      errors.username = '사용자 이름을 입력해주세요.';
      hasErrors = true;
    } else if (username.trim().length < 5) {
      errors.username = '사용자 이름은 최소 5글자 이상이어야 합니다.';
      hasErrors = true;
    }
    
    // Password validation
    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
      hasErrors = true;
    } else if (password.trim().length < 10) {
      errors.password = '비밀번호는 최소 10글자 이상이어야 합니다.';
      hasErrors = true;
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = '비밀번호는 최소 1개 이상의 숫자를 포함해야 합니다.';
      hasErrors = true;
    }
    
    // If there are errors, prevent form submission and show client-side errors
    if (hasErrors) {
      event.preventDefault();
      setClientErrors(errors);
    }
  };

  // 폼 액션 재정의 - formData에 현재 값을 설정
  const handleFormAction = (formData: FormData) => {
    // 현재 값을 formData에 설정
    formData.set('email', formValues.email);
    formData.set('username', formValues.username);
    formData.set('password', formValues.password);
    return formAction(formData);
  };

  return (
    <FormContainer title="계정 만들기">
      <form action={handleFormAction} onSubmit={validateAndSubmit} className="mt-8 space-y-6" noValidate>
        {state.message && !state.success && (
          <div className="p-3 rounded-md bg-red-100 text-red-800">
            {state.message}
          </div>
        )}
        
        <div>
          <Input 
            name="email" 
            type="email" 
            placeholder="Email (@zod.com)" 
            icon={<EmailIcon />}
            error={clientErrors.email || state.errors?.email}
            value={formValues.email}
            onChange={handleInputChange}
            required
            disabled={useFormStatus().pending}
          />
          {!clientErrors.email && !state.errors?.email && (
            <p className="text-gray-500 text-xs mt-1 ml-1">이메일은 @zod.com으로 끝나야 합니다</p>
          )}
        </div>
        
        <div>
          <Input 
            name="username" 
            placeholder="Username (5+ characters)" 
            icon={<UserIcon />}
            error={clientErrors.username || state.errors?.username}
            value={formValues.username}
            onChange={handleInputChange}
            required
            disabled={useFormStatus().pending}
          />
          {!clientErrors.username && !state.errors?.username && (
            <p className="text-gray-500 text-xs mt-1 ml-1">사용자 이름은 5글자 이상이어야 합니다</p>
          )}
        </div>
        
        <div>
          <Input 
            name="password" 
            type="password" 
            placeholder="Password (10+ characters with a number)" 
            icon={<LockIcon />}
            error={clientErrors.password || state.errors?.password}
            value={formValues.password}
            onChange={handleInputChange}
            required
            disabled={useFormStatus().pending}
          />
          {!clientErrors.password && !state.errors?.password && (
            <p className="text-gray-500 text-xs mt-1 ml-1">비밀번호는 10글자 이상, 숫자 1개 이상 포함해야 합니다</p>
          )}
        </div>
        
        <div className="mt-6">
          <SubmitButton />
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/log-in" className="text-pink-500 hover:underline">
            로그인
          </Link>
        </div>
      </form>
    </FormContainer>
  );
}
