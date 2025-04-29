'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// 트윗 폼 상태 인터페이스
export interface TweetFormState {
  success: boolean;
  message: string;
  error?: string;
  tweet?: string;
}

// 트윗 생성 스키마
const tweetSchema = z.object({
  tweet: z.string()
    .min(1, { message: '트윗 내용을 입력해주세요.' })
    .max(280, { message: '트윗은 최대 280자까지 입력 가능합니다.' })
});

// 트윗 생성 액션
export async function createTweetAction(prevState: TweetFormState, formData: FormData): Promise<TweetFormState> {
  try {
    // 로그인 확인
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        message: '',
        error: '로그인이 필요합니다.'
      };
    }

    // 트윗 내용 가져오기
    const tweet = formData.get('tweet') as string;

    // 유효성 검사
    const validationResult = tweetSchema.safeParse({ tweet });
    if (!validationResult.success) {
      const error = validationResult.error.errors[0];
      return {
        success: false,
        message: '',
        error: error.message,
        tweet
      };
    }

    // 트윗 생성
    await db.tweet.create({
      data: {
        tweet: validationResult.data.tweet,
        userId: session.userId
      }
    });

    // 캐시 갱신
    revalidatePath('/');

    return {
      success: true,
      message: '트윗이 게시되었습니다.',
      tweet: ''
    };
  } catch (error) {
    console.error('트윗 생성 오류:', error);
    
    return {
      success: false,
      message: '',
      error: '트윗 게시 중 오류가 발생했습니다. 다시 시도해주세요.'
    };
  }
}
