'use client';

import { useState, useEffect, useOptimistic } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfileAction, ProfileFormState } from '@/app/actions/users';
import Button from '@/components/Button';
import Input from '@/components/Input';
import FormContainer from '@/components/FormContainer';
import { getSession } from '@/lib/session';

// 제출 버튼 컴포넌트
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full py-2 px-4 mt-4">
      {pending ? '저장 중...' : '저장하기'}
    </Button>
  );
}

interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
}

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // 폼 상태 초기화
  const initialState: ProfileFormState = {
    success: false,
    message: '',
    values: {
      username: '',
      email: '',
      bio: ''
    }
  };

  // Server Action 상태 관리
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  
  // Optimistic 업데이트를 위한 상태
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (state, newData: { username?: string; email?: string; bio?: string }) => {
      if (!state) return state;
      return { ...state, ...newData };
    }
  );

  // 현재 사용자 정보 로드
  const loadUserData = async () => {
    setLoading(true);
    setError('');

    try {
      // 세션 확인
      const session = await getSession();
      if (!session || !session.user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 현재 URL의 username과 로그인한 사용자가 일치하는지 확인
      if (username !== session.user.username) {
        throw new Error('다른 사용자의 프로필을 수정할 수 없습니다.');
      }

      // 사용자 정보 가져오기
      const res = await fetch(`/api/users/${username}`);
      
      if (!res.ok) {
        throw new Error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
      
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('Profile load error:', err);
      setError(err instanceof Error ? err.message : '사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 제출 핸들러 (Optimistic 업데이트 적용)
  const handleSubmit = async (formData: FormData) => {
    // Optimistic 업데이트 적용
    setOptimisticUser({
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      bio: formData.get('bio') as string || null
    });

    // 서버 액션 호출
    formAction(formData);
  };

  // 초기 로드 시 사용자 정보 가져오기
  useEffect(() => {
    loadUserData();
  }, []);

  // 성공 시 리디렉션
  useEffect(() => {
    if (state.success) {
      const newUsername = state.values?.username || username;
      setTimeout(() => {
        router.push(`/users/${newUsername}`);
      }, 1500);
    }
  }, [state.success]);

  // 로딩 중 상태
  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/')} className="py-2 px-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  // 사용자 정보가 없는 경우
  if (!optimisticUser) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>사용자 정보를 불러올 수 없습니다.</p>
        <Button onClick={() => router.push('/')} className="mt-4 py-2 px-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">프로필 수정</h1>

      {/* 성공 메시지 */}
      {state.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {state.message}
        </div>
      )}

      {/* 에러 메시지 */}
      {!state.success && state.message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {state.message}
        </div>
      )}

      <FormContainer>
        <form action={handleSubmit}>
          {/* 사용자명 */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자명
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              defaultValue={optimisticUser.username}
              error={state.errors?.username}
              required
            />
            {state.errors?.username && (
              <p className="mt-1 text-xs text-red-600">{state.errors.username}</p>
            )}
          </div>

          {/* 이메일 */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={optimisticUser.email}
              error={state.errors?.email}
              required
            />
            {state.errors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.errors.email}</p>
            )}
          </div>

          {/* 자기소개 */}
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              자기소개
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={optimisticUser.bio || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {state.errors?.bio && (
              <p className="mt-1 text-xs text-red-600">{state.errors.bio}</p>
            )}
          </div>

          {/* 비밀번호 변경 토글 */}
          <div className="mb-4">
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
            >
              {showPasswordFields ? '비밀번호 변경 취소' : '비밀번호 변경하기'}
            </button>
          </div>

          {/* 비밀번호 변경 필드 */}
          {showPasswordFields && (
            <div className="border p-4 rounded-md bg-gray-50 mb-4">
              <h2 className="text-lg font-semibold mb-3">비밀번호 변경</h2>
              
              {/* 현재 비밀번호 */}
              <div className="mb-3">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  현재 비밀번호
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  error={state.errors?.currentPassword}
                />
                {state.errors?.currentPassword && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.currentPassword}</p>
                )}
              </div>
              
              {/* 새 비밀번호 */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  error={state.errors?.newPassword}
                />
                {state.errors?.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.newPassword}</p>
                )}
              </div>
              
              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  error={state.errors?.confirmPassword}
                />
                {state.errors?.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <SubmitButton />

          {/* 취소 버튼 */}
          <Button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2 px-4 mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            취소
          </Button>
        </form>
      </FormContainer>
    </div>
  );
}
