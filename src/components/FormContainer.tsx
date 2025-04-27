'use client';

import { ReactNode } from 'react';
import { FireIcon } from './Icons';

interface FormContainerProps {
  title: string;
  children: ReactNode;
}

export default function FormContainer({ title, children }: FormContainerProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center gap-4">
          <FireIcon />
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        
        {children}
      </div>
    </main>
  );
}
