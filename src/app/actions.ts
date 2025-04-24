'use server';

export interface FormState {
  success: boolean;
  message: string;
}

export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
  // Simulate server processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  // Validate inputs
  if (!email || !username || !password) {
    return {
      success: false,
      message: '모든 필드를 입력해주세요.'
    };
  }
  
  // Check if password is correct
  if (password === '12345') {
    return {
      success: true,
      message: '로그인 성공! 환영합니다.'
    };
  } else {
    return {
      success: false,
      message: '비밀번호가 일치하지 않습니다.'
    };
  }
}
