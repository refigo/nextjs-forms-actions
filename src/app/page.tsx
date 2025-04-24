'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { loginAction, FormState } from './actions';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { EmailIcon, UserIcon, LockIcon, FireIcon } from '@/components/Icons';
import { FormEvent, useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '로그인 중...' : '로그인'}
    </Button>
  );
}

export default function Home() {
  const initialState: FormState = {
    success: false,
    message: '',
    errors: {},
    values: {
      email: '',
      username: '',
      password: ''
    }
  };

  const [state, formAction] = useActionState(loginAction, initialState);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <FireIcon />
        </div>
        
        <form action={formAction} onSubmit={validateAndSubmit} className="mt-8 space-y-6" noValidate>
          {state.success && state.message && (
            <div className="p-3 rounded-md bg-green-100 text-green-800">
              {state.message}
            </div>
          )}
          
          <div>
            <Input 
              name="email" 
              type="email" 
              placeholder="Email" 
              icon={<EmailIcon />}
              error={clientErrors.email || state.errors?.email}
              value={state.values?.email}
              required
              disabled={useFormStatus().pending}
            />
          </div>
          
          <div>
            <Input 
              name="username" 
              placeholder="Username" 
              icon={<UserIcon />}
              error={clientErrors.username || state.errors?.username}
              value={state.values?.username}
              required
              disabled={useFormStatus().pending}
            />
          </div>
          
          <div>
            <Input 
              name="password" 
              type="password" 
              placeholder="Password" 
              icon={<LockIcon />}
              error={clientErrors.password || state.errors?.password}
              required
              disabled={useFormStatus().pending}
            />
          </div>
          
          <div className="mt-6">
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
