'use server';

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
  
  // Validate inputs
  if (!email || !username || !password) {
    return {
      success: false,
      message: '모든 필드를 입력해주세요.',
      errors: {
        ...((!email) ? { email: '이메일을 입력해주세요.' } : {}),
        ...((!username) ? { username: '사용자 이름을 입력해주세요.' } : {}),
        ...((!password) ? { password: '비밀번호를 입력해주세요.' } : {})
      },
      values
    };
  }
  
  // Check if password is correct
  if (password === '12345') {
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
