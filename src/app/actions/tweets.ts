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

// 좋아요 상태 인터페이스
export interface LikeState {
  success: boolean;
  message?: string;
  error?: string;
}

// 응답(답글) 폼 상태 인터페이스
export interface ResponseFormState {
  success: boolean;
  message?: string;
  error?: string;
  text?: string;
}

// 트윗 생성 스키마
const tweetSchema = z.object({
  tweet: z.string()
    .min(1, { message: '트윗 내용을 입력해주세요.' })
    .max(280, { message: '트윗은 최대 280자까지 입력 가능합니다.' })
});

// 응답(답글) 생성 스키마
const responseSchema = z.object({
  text: z.string()
    .min(1, { message: '답글 내용을 입력해주세요.' })
    .max(280, { message: '답글은 최대 280자까지 입력 가능합니다.' })
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

// 트윗 좋아요 액션
export async function likeTweetAction(tweetId: string): Promise<LikeState> {
  try {
    // 로그인 확인
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.'
      };
    }

    // 트윗 확인
    const tweet = await db.tweet.findUnique({
      where: { id: tweetId }
    });

    if (!tweet) {
      return {
        success: false,
        error: '존재하지 않는 트윗입니다.'
      };
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await db.like.findUnique({
      where: {
        userId_tweetId: {
          userId: session.userId,
          tweetId
        }
      }
    });

    // 이미 좋아요를 눌렀다면 삭제
    if (existingLike) {
      await db.like.delete({
        where: { id: existingLike.id }
      });

      // 캐시 갱신
      revalidatePath(`/tweets/${tweetId}`);

      return {
        success: true,
        message: '좋아요가 취소되었습니다.'
      };
    }

    // 좋아요 생성
    await db.like.create({
      data: {
        userId: session.userId,
        tweetId
      }
    });

    // 캐시 갱신
    revalidatePath(`/tweets/${tweetId}`);

    return {
      success: true,
      message: '좋아요를 눌렀습니다.'
    };
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    
    return {
      success: false,
      error: '좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
    };
  }
}

// 트윗 답글 작성 액션
export async function createResponseAction(prevState: ResponseFormState, formData: FormData): Promise<ResponseFormState> {
  try {
    // 로그인 확인
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.'
      };
    }

    // 답글 내용 및 트윗 ID 가져오기
    const text = formData.get('text') as string;
    const tweetId = formData.get('tweetId') as string;

    // 트윗 확인
    const tweet = await db.tweet.findUnique({
      where: { id: tweetId }
    });

    if (!tweet) {
      return {
        success: false,
        error: '존재하지 않는 트윗입니다.',
        text
      };
    }

    // 유효성 검사
    const validationResult = responseSchema.safeParse({ text });
    if (!validationResult.success) {
      const error = validationResult.error.errors[0];
      return {
        success: false,
        error: error.message,
        text
      };
    }

    // 답글 생성
    await db.response.create({
      data: {
        text: validationResult.data.text,
        userId: session.userId,
        tweetId
      }
    });

    // 캐시 갱신
    revalidatePath(`/tweets/${tweetId}`);

    return {
      success: true,
      message: '답글이 게시되었습니다.',
      text: ''
    };
  } catch (error) {
    console.error('답글 생성 오류:', error);
    
    return {
      success: false,
      error: '답글 게시 중 오류가 발생했습니다. 다시 시도해주세요.'
    };
  }
}
