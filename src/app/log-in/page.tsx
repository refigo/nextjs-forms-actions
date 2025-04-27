'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { loginAction, AuthFormState } from '../actions/auth';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { EmailIcon, LockIcon } from '@/components/Icons';
import FormContainer from '@/components/FormContainer';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '로그인 중...' : '로그인'}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const initialState: AuthFormState = {
    success: false,
    message: '',
    errors: {},
    values: {
      email: '',
      password: ''
    }
  };

  const [state, formAction] = useActionState(loginAction, initialState);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Client-side validation handler
  const validateAndSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Reset client errors
    setClientErrors({});
    
    // Get form elements
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    // Validate each field
    let hasErrors = false;
    const errors: {
      email?: string;
      password?: string;
    } = {};
    
    // Email validation
    if (!emailInput.value.trim()) {
      errors.email = '이메일을 입력해주세요.';
      hasErrors = true;
    }
    
    // Password validation
    if (!passwordInput.value.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
      hasErrors = true;
    }
    
    // If there are errors, prevent form submission and show client-side errors
    if (hasErrors) {
      event.preventDefault();
      setClientErrors(errors);
    }
  };

  // If login is successful, redirect to profile page
  if (state.success) {
    router.push('/profile');
    return null;
  }

  return (
    <FormContainer title="로그인">
      <form action={formAction} onSubmit={validateAndSubmit} className="mt-8 space-y-6" noValidate>
        {state.message && (
          <div className="p-3 rounded-md bg-red-100 text-red-800">
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

        <div className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link href="/create-account" className="text-pink-500 hover:underline">
            회원가입
          </Link>
        </div>
      </form>
    </FormContainer>
  );
}
