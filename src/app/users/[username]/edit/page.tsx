'use client';

import { useState, useEffect, useOptimistic, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfileAction, ProfileFormState } from '@/app/actions/users';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { fetchSession } from '@/lib/clientSession';

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
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  
  // 유저 상태
  const [user, setUser] = useState<User | null>(null);
  // useOptimistic 후크 사용 (변경된 React API에 맞춰 수정)
  const [optimisticUser, setOptimisticUser] = useOptimistic<User | null>(null);
  
  // 폼 액션 상태
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    { errors: {}, success: false, message: '' }
  );
  
  // 폼 제출 핸들러 (낙관적 UI 업데이트 포함)
  const handleSubmit = (formData: FormData) => {
    // 유저 정보가 없는 경우
    if (!optimisticUser) return;
    
    // 낙관적 업데이트를 위한 새 유저 정보 객체 생성
    const updatedUser = { ...optimisticUser };
    updatedUser.username = formData.get('username') as string;
    updatedUser.email = formData.get('email') as string;
    updatedUser.bio = formData.get('bio') as string;
    
    // 폼 액션 내에서는 setOptimisticUser 자동으로 적용됨 (별도의 호출 불필요)
    // 폼 액션 호출
    return formAction(formData);
  };
  
  // 유저 데이터 로드 - 세션 확인 및 프로필 정보 가져오기
  useEffect(() => {
    const loadUserData = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError('');
        
        console.log('세션 정보 요청 중...');
        
        // 세션 확인 (세션 API에서 얼마나 응답이 오는지 확인용 로그)
        const session = await fetchSession();
        console.log('클라이언트 세션 응답:', session);
        
        if (!session || !session.isLoggedIn) {
          throw new Error('로그인이 필요합니다.');
        }

        if (!session.username) {
          throw new Error('세션 정보에 사용자명이 없습니다.');
        }

        // 현재 URL의 username과 로그인한 사용자가 일치하는지 확인
        if (username !== session.username) {
          throw new Error('다른 사용자의 프로필을 수정할 수 없습니다.');
        }
        
        // 사용자 프로필 정보 가져오기
        console.log('사용자 프로필 정보 요청 중...');
        const response = await fetch(`/api/users/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('사용자를 찾을 수 없습니다.');
          }
          throw new Error('프로필 정보를 불러오는 중 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        
        if (!data.user) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }
        
        console.log('프로필 데이터 받음:', data.user);
        setUser(data.user);
        
        // 상태 업데이트 방식 변경
        // 1. 일반 상태 업데이트
        setUser(data.user);
        
        // 2. useOptimistic 업데이트는 startTransition 내에서 수행
        startTransition(() => {
          setOptimisticUser(data.user);
        });
      } catch (err) {
        console.error('프로필 로드 중 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [username]);

  // 성공 시 리디렉션
  useEffect(() => {
    if (state.success) {
      // 새 사용자명으로 리디렉션(변경된 경우)
      const newUsername = optimisticUser?.username || username;
      setTimeout(() => {
        router.push(`/users/${newUsername}`);
      }, 1500);
    }
  }, [state.success, optimisticUser, username, router]);

  // 로딩 처리
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center">
            <h1 className="text-3xl font-bold text-gray-800">프로필 수정</h1>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mt-8"></div>
          </div>
        </div>
      </main>
    );
  }

  // 에러 처리
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <Button onClick={() => router.push(`/users/${username}`)} className="py-2 px-4 !w-auto">
            프로필로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // 사용자 정보가 없는 경우 - user 상태도 확인
  if (!optimisticUser && !user) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">사용자 정보를 불러올 수 없습니다.</h1>
          <Button onClick={() => router.push('/')} className="py-2 px-4 !w-auto">
            홈으로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // 현재 화면에 표시할 사용자 데이터 (낙관적 업데이트가 없으면 기본 사용자 데이터 사용)
  const currentUser = optimisticUser || user;
  
  // 디버깅용 로그
  console.log('Rendering with currentUser:', currentUser);
  
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">프로필 수정</h1>
          <Button 
            onClick={() => router.push(`/users/${username}`)} 
            className="py-2 px-4 !w-auto border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            취소
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form action={handleSubmit} className="space-y-6">
            {/* 사용자명 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                defaultValue={currentUser?.username || ''}
                error={state.errors?.username}
                required={true}
                className="w-full"
              />
            </div>
            
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="text"
                defaultValue={currentUser?.email || ''}
                error={state.errors?.email}
                required={true}
                className="w-full"
              />
            </div>
            
            {/* 자기소개 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={currentUser?.bio ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {state.errors?.bio && (
                <p className="mt-1.5 text-sm text-red-600">{state.errors.bio}</p>
              )}
            </div>
            
            {/* 비밀번호 섹션 */}
            <div className="py-2 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">비밀번호 관리</h3>
                {!showPasswordUpdate ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordUpdate(true)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    비밀번호 변경
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPasswordUpdate(false)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    취소
                  </button>
                )}
              </div>
              
              {showPasswordUpdate && (
                <div className="space-y-4">
                  {/* 새 비밀번호 */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      새 비밀번호
                    </label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      error={state.errors?.newPassword}
                      className="w-full"
                    />
                  </div>
                  
                  {/* 비밀번호 확인 */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 확인
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      error={state.errors?.confirmPassword}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <SubmitButton />
            </div>
            
            {state.message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                {state.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
