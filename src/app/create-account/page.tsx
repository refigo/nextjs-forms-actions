'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { signupAction, AuthFormState } from '../actions/auth';
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
  const initialState: AuthFormState = {
    success: false,
    message: '',
    errors: {},
    values: {
      email: '',
      username: '',
      password: ''
    }
  };

  const [state, formAction] = useActionState(signupAction, initialState);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});

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
    
    // Get form elements
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    // Validate each field
    let hasErrors = false;
    const errors: {
      email?: string;
      username?: string;
      password?: string;
    } = {};
    
    // Email validation
    if (!emailInput.value.trim()) {
      errors.email = '이메일을 입력해주세요.';
      hasErrors = true;
    } else if (!emailInput.value.trim().endsWith('@zod.com')) {
      errors.email = '오직 @zod.com 도메인의 이메일만 허용됩니다.';
      hasErrors = true;
    }
    
    // Username validation
    if (!usernameInput.value.trim()) {
      errors.username = '사용자 이름을 입력해주세요.';
      hasErrors = true;
    } else if (usernameInput.value.trim().length < 5) {
      errors.username = '사용자 이름은 최소 5글자 이상이어야 합니다.';
      hasErrors = true;
    }
    
    // Password validation
    if (!passwordInput.value.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
      hasErrors = true;
    } else if (passwordInput.value.trim().length < 10) {
      errors.password = '비밀번호는 최소 10글자 이상이어야 합니다.';
      hasErrors = true;
    } else if (!/(?=.*\d)/.test(passwordInput.value)) {
      errors.password = '비밀번호는 최소 1개 이상의 숫자를 포함해야 합니다.';
      hasErrors = true;
    }
    
    // If there are errors, prevent form submission and show client-side errors
    if (hasErrors) {
      event.preventDefault();
      setClientErrors(errors);
    }
  };

  return (
    <FormContainer title="계정 만들기">
      <form action={formAction} onSubmit={validateAndSubmit} className="mt-8 space-y-6" noValidate>
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
            value={state.values?.email}
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
            value={state.values?.username}
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
