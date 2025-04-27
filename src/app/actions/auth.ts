'use server';

import { redirect } from 'next/navigation';
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
    bio?: string;
  };
  values?: {
    email?: string;
    username?: string;
    password?: string;
    bio?: string;
  };
}

// Update the interface for login form state
export interface LoginFormState extends AuthFormState {
  values: {
    email: string;
    password: string;
  };
}

// Update the interface for signup form state
export interface SignupFormState extends AuthFormState {
  values: {
    email: string;
    username: string;
    password: string;
    bio: string;
  };
}

// Sign-up form schema without async refinements
const signupSchema = z.object({
  email: z.string()
    .email({ message: '올바른 이메일 형식이 아닙니다.' })
    .endsWith('@zod.com', { message: '오직 @zod.com 도메인의 이메일만 허용됩니다.' }),
  username: z.string()
    .min(5, { message: '사용자 이름은 최소 5글자 이상이어야 합니다.' }),
  password: z.string()
    .min(10, { message: '비밀번호는 최소 10글자 이상이어야 합니다.' })
    .refine((password) => /(?=.*\d)/.test(password), {
      message: '비밀번호는 최소 1개 이상의 숫자를 포함해야 합니다.'
    }),
  bio: z.string().optional(),
});

// Login form schema
const loginSchema = z.object({
  email: z.string()
    .email({ message: '올바른 이메일 형식이 아닙니다.' })
    .endsWith('@zod.com', { message: '오직 @zod.com 도메인의 이메일만 허용됩니다.' }),
  password: z.string()
    .min(10, { message: '비밀번호는 최소 10글자 이상이어야 합니다.' })
    .refine((password) => /(?=.*\d)/.test(password), {
      message: '비밀번호는 최소 1개 이상의 숫자를 포함해야 합니다.'
    })
});

// Sign-up action
export async function signupAction(prevState: SignupFormState, formData: FormData): Promise<SignupFormState> {
  // Reset the state
  const state: SignupFormState = {
    success: false,
    message: '',
    errors: {},
    values: {
      email: formData.get('email') as string || '',
      username: formData.get('username') as string || '',
      password: formData.get('password') as string || '',
      bio: formData.get('bio') as string || '',
    }
  };

  try {
    // Use regular safeParse since we removed async refinements
    const validatedFields = signupSchema.safeParse({
      email: state.values.email,
      username: state.values.username,
      password: state.values.password,
      bio: state.values.bio,
    });

    // If validation fails, return errors
    if (!validatedFields.success) {
      return {
        ...state,
        errors: formatZodErrors(validatedFields.error),
      };
    }

    // Check if the email is already in use
    const existingUserByEmail = await db.user.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (existingUserByEmail) {
      return {
        ...state,
        errors: {
          email: '이미 사용 중인 이메일입니다.',
        },
      };
    }

    // Check if the username is already in use
    const existingUserByUsername = await db.user.findUnique({
      where: { username: validatedFields.data.username },
    });

    if (existingUserByUsername) {
      return {
        ...state,
        errors: {
          username: '이미 사용 중인 사용자 이름입니다.',
        },
      };
    }

    // Hash the password
    const hashedPassword = await hashPassword(validatedFields.data.password);

    // Create the user in the database
    const user = await db.user.create({
      data: {
        email: validatedFields.data.email,
        username: validatedFields.data.username,
        password: hashedPassword,
        bio: validatedFields.data.bio || '',
      },
    });

    console.log('User created successfully:', user.id);

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
      message: '회원가입이 완료되었습니다. 리디렉션 중...',
      values: {
        ...state.values,
        password: '',  // Clear password for security
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    
    return {
      ...state,
      message: '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.',
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
