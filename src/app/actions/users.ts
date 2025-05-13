'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { revalidatePath } from 'next/cache';

// 프로필 수정 폼 상태 인터페이스
export interface ProfileFormState {
  success: boolean;
  message: string;
  errors?: {
    username?: string;
    email?: string;
    bio?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  values?: {
    username?: string;
    email?: string;
    bio?: string;
  };
}

// 프로필 수정 스키마 (비밀번호 변경 없는 경우)
const profileSchema = z.object({
  username: z.string()
    .min(3, { message: '사용자명은 3자 이상이어야 합니다.' })
    .max(20, { message: '사용자명은 20자 이하이어야 합니다.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: '사용자명은 영문, 숫자, 밑줄만 포함할 수 있습니다.' }),
  email: z.string()
    .email({ message: '올바른 이메일 형식이 아닙니다.' }),
  bio: z.string().max(160, { message: '자기소개는 160자 이하이어야 합니다.' }).optional(),
});

// 비밀번호 변경 스키마
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: '현재 비밀번호를 입력해주세요.' }),
  newPassword: z.string()
    .min(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
    .regex(/[A-Z]/, { message: '비밀번호는 대문자를 1개 이상 포함해야 합니다.' })
    .regex(/[a-z]/, { message: '비밀번호는 소문자를 1개 이상 포함해야 합니다.' })
    .regex(/[0-9]/, { message: '비밀번호는 숫자를 1개 이상 포함해야 합니다.' }),
  confirmPassword: z.string().min(1, { message: '비밀번호 확인을 입력해주세요.' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

// 프로필 수정 액션
export async function updateProfileAction(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  // 세션 확인 (세션 형식 변화에 대응)
  const session = await getSession();
  console.log('[Server Action] Session:', session);
  
  // 기존 형식 (session.user 내부에 사용자 정보가 있는 경우)
  if (session.user) {
    // 기존 형식 유지
  } 
  // 새 형식 (session 자체에 사용자 정보가 있는 경우)
  else if (session.isLoggedIn && session.userId) {
    // 세션 데이터 구조 변환
    session.user = {
      id: session.userId,
      username: session.username || '',
      email: session.email || ''
    };
  } 
  // 로그인 안 되어 있는 경우
  else {
    return {
      success: false,
      message: '로그인이 필요합니다.',
    };
  }

  // 폼 데이터 파싱
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const bio = formData.get('bio') as string;
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 프로필 정보 유효성 검사
  try {
    profileSchema.parse({ username, email, bio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: '입력 정보를 확인해주세요.',
        errors: formatZodErrors(error),
        values: { username, email, bio }
      };
    }
    return {
      success: false,
      message: '유효하지 않은 입력 정보입니다.',
      values: { username, email, bio }
    };
  }

  // 이메일과 사용자명 중복 확인 (현재 사용자 제외)
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ],
      NOT: {
        id: session.user.id
      }
    }
  });

  if (existingUser) {
    return {
      success: false,
      message: '이미 사용 중인 이메일 또는 사용자명입니다.',
      values: { username, email, bio }
    };
  }

  // 비밀번호 변경 요청이 있는지 확인
  if (currentPassword) {
    // 비밀번호 스키마 검증
    try {
      passwordSchema.parse({ currentPassword, newPassword, confirmPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          message: '비밀번호 정보를 확인해주세요.',
          errors: formatZodErrors(error),
          values: { username, email, bio }
        };
      }
      return {
        success: false,
        message: '유효하지 않은 비밀번호 정보입니다.',
        values: { username, email, bio }
      };
    }

    // 현재 비밀번호 확인
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    if (!user || !(await verifyPassword(currentPassword, user.password))) {
      return {
        success: false,
        message: '현재 비밀번호가 일치하지 않습니다.',
        errors: { currentPassword: '현재 비밀번호가 일치하지 않습니다.' },
        values: { username, email, bio }
      };
    }

    // 비밀번호 해싱은 이후 업데이트 시에 진행
  }

  try {
    // 현재 사용자 정보가 없는 경우 (이미 체크했지만 타입 안전성을 위해)
    if (!session.user || !session.user.id) {
      return {
        success: false,
        message: '로그인 세션이 유효하지 않습니다.',
        values: { username, email, bio }
      };
    }
    
    // 비밀번호 변경 여부에 따라 처리
    if (currentPassword && newPassword && confirmPassword) {
      // 비밀번호 변경 처리
      // 현재 비밀번호 확인
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          values: { username, email, bio }
        };
      }

      // 비밀번호 스키마 검증
      try {
        passwordSchema.parse({ currentPassword, newPassword, confirmPassword });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            message: '비밀번호 정보를 확인해주세요.',
            errors: formatZodErrors(error),
            values: { username, email, bio }
          };
        }
        return {
          success: false,
          message: '유효하지 않은 비밀번호 정보입니다.',
          values: { username, email, bio }
        };
      }

      // 비밀번호 해싱
      const hashedPassword = await hashPassword(newPassword);

      // 프로필 업데이트
      await db.user.update({
        where: { id: session.user.id },
        data: {
          username,
          email,
          bio,
          password: hashedPassword
        }
      });
    } else {
      // 프로필 업데이트
      await db.user.update({
        where: { id: session.user.id },
        data: {
          username,
          email,
          bio
        }
      });
    }

    // 경로 재검증
    revalidatePath(`/users/${username}`);
    revalidatePath(`/profile`);

    return {
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      values: { username, email, bio }
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      values: { username, email, bio }
    };
  }
}

// Zod 오류 포맷팅 헬퍼 함수
function formatZodErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}
