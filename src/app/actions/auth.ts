'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { setSession, logout } from '@/lib/session';

// Common form state interface
export interface AuthFormState {
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

// Update the interface for login form state
interface LoginFormState extends AuthFormState {
  values: {
    email: string;
    password: string;
  };
}

// Sign-up form schema
const signupSchema = z.object({
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
})
.superRefine(async ({ email, username }, ctx) => {
  // Check if email already exists
  const existingUserByEmail = await db.user.findUnique({ where: { email } });
  if (existingUserByEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '이미 사용 중인 이메일입니다.',
      path: ['email']
    });
  }

  // Check if username already exists
  const existingUserByUsername = await db.user.findUnique({ where: { username } });
  if (existingUserByUsername) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '이미 사용 중인 사용자 이름입니다.',
      path: ['username']
    });
  }
});

// Login form schema
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: '이메일을 입력해주세요.' })
    .email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  password: z.string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
});

// Sign-up action
export async function signupAction(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
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
  
  try {
    // Validate using Zod
    const validationResult = await signupSchema.safeParseAsync({
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
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create the user
    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        bio: '',
      }
    });
    
    // Set user session
    await setSession({
      isLoggedIn: true,
      userId: user.id,
      username: user.username,
      email: user.email,
    });
    
    return {
      success: true,
      message: '계정이 성공적으로 생성되었습니다!',
      values: {
        email: '',
        username: '',
        password: ''
      }
    };
  } catch (error) {
    console.error('Sign-up error:', error);
    return {
      success: false,
      message: '계정 생성 중 오류가 발생했습니다. 다시 시도해 주세요.',
      values
    };
  }
}

// Login action
export async function loginAction(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  // Reset the state
  const state: LoginFormState = {
    success: false,
    message: '',
    errors: {},
    values: {
      email: formData.get('email') as string || '',
      password: formData.get('password') as string || '',
    }
  };

  try {
    // Validate the form data
    const validatedFields = loginSchema.safeParse({
      email: state.values.email,
      password: state.values.password,
    });

    // If validation fails, return errors
    if (!validatedFields.success) {
      return {
        ...state,
        errors: formatZodErrors(validatedFields.error),
      };
    }

    // Find user with the given email
    const user = await db.user.findUnique({
      where: {
        email: validatedFields.data.email,
      },
    });

    // If user not found, return error
    if (!user) {
      return {
        ...state,
        errors: {
          email: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
      };
    }

    // Verify password
    const passwordValid = await verifyPassword(
      validatedFields.data.password,
      user.password
    );

    // If password is invalid, return error
    if (!passwordValid) {
      return {
        ...state,
        errors: {
          password: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
      };
    }

    // Set session data using our updated session module
    await setSession({
      isLoggedIn: true,
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // Return success
    return {
      ...state,
      success: true,
      message: '로그인이 완료되었습니다. 리디렉션 중...',
    };
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      ...state,
      message: '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.',
    };
  }
}

// Logout action
export async function logoutAction() {
  await logout();
  
  // Redirect to login page after logout
  return Response.redirect('/log-in');
}

// Helper function to format Zod errors
function formatZodErrors(error: z.ZodError) {
  return error.flatten().fieldErrors;
}
