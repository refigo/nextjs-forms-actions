'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { loginAction, FormState } from './actions';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { EmailIcon, UserIcon, LockIcon, FireIcon } from '@/components/Icons';

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
  };

  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <FireIcon />
        </div>
        
        <form action={formAction} className="mt-8 space-y-6">
          {state.message && (
            <div className={`p-3 rounded-md ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {state.message}
            </div>
          )}
          
          <Input 
            name="email" 
            type="email" 
            placeholder="Email" 
            icon={<EmailIcon />}
            disabled={useFormStatus().pending}
          />
          
          <Input 
            name="username" 
            placeholder="Username" 
            icon={<UserIcon />}
            disabled={useFormStatus().pending}
          />
          
          <Input 
            name="password" 
            type="password" 
            placeholder="Password" 
            icon={<LockIcon />}
            disabled={useFormStatus().pending}
          />
          
          <div className="mt-6">
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
