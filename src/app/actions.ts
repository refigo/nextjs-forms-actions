'use server';

import { z } from 'zod';

export interface FormState {
  success: boolean;
  message: string;
  errors?: {
    email?: string;
    username?: string;
    password?: string;
  };
  values?: {
    email?: string;
    username?: string;
    password?: string;
  };
}

// Define the login form schema with Zod
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: '이메일을 입력해주세요.' })
    .email({ message: '유효한 이메일 주소를 입력해주세요.' })
    .refine((email) => email.endsWith('@zod.com'), {
      message: '오직 @zod.com 도메인의 이메일만 허용됩니다.'
    }),
  username: z.string()
    .min(5, { message: '사용자 이름은 최소 5글자 이상이어야 합니다.' }),
  password: z.string()
    .min(10, { message: '비밀번호는 최소 10글자 이상이어야 합니다.' })
    .refine((password) => /(?=.*\d)/.test(password), {
      message: '비밀번호는 최소 1개 이상의 숫자를 포함해야 합니다.'
    })
});

export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
  // Simulate server processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  // Store the submitted values
  const values = {
    email,
    username,
    password: '' // Don't send the password back for security
  };
  
  // Validate using Zod
  const validationResult = loginSchema.safeParse({
    email,
    username,
    password
  });
  
  // If validation fails, return errors
  if (!validationResult.success) {
    const zodErrors = validationResult.error.flatten().fieldErrors;
    
    return {
      success: false,
      message: '',
      errors: {
        email: zodErrors.email?.[0],
        username: zodErrors.username?.[0],
        password: zodErrors.password?.[0]
      },
      values
    };
  }
  
  // Check if password is correct (after validation passes)
  if (password === '1234512345') {
    return {
      success: true,
      message: '로그인 성공! 환영합니다.',
      values: {
        email: '',
        username: '',
        password: ''
      }
    };
  } else {
    return {
      success: false,
      message: '',
      errors: {
        password: 'wrong password'
      },
      values: {
        email,
        username,
        password: '' // Don't send the password back for security
      }
    };
  }
}
