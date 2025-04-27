import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Clean up existing data
    await db.like.deleteMany({});
    await db.tweet.deleteMany({});
    await db.user.deleteMany({});

    // Create sample users
    const user1 = await db.user.create({
      data: {
        username: 'user1',
        email: 'user1@zod.com',
        password: '1234512345',
        bio: '안녕하세요! 첫 번째 샘플 사용자입니다.',
      },
    });

    const user2 = await db.user.create({
      data: {
        username: 'user2',
        email: 'user2@zod.com',
        password: '1234512345',
        bio: '두 번째 샘플 사용자입니다.',
      },
    });

    // Create sample tweets
    const tweet1 = await db.tweet.create({
      data: {
        tweet: '안녕하세요! 이것은 첫 번째 트윗입니다.',
        userId: user1.id,
      },
    });

    const tweet2 = await db.tweet.create({
      data: {
        tweet: '반갑습니다! 두 번째 트윗입니다.',
        userId: user1.id,
      },
    });

    const tweet3 = await db.tweet.create({
      data: {
        tweet: '안녕하세요! user2의 첫 번째 트윗입니다.',
        userId: user2.id,
      },
    });

    // Create sample likes
    const like1 = await db.like.create({
      data: {
        userId: user2.id,
        tweetId: tweet1.id,
      },
    });

    const like2 = await db.like.create({
      data: {
        userId: user1.id,
        tweetId: tweet3.id,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        users: [user1, user2],
        tweets: [tweet1, tweet2, tweet3],
        likes: [like1, like2],
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed database',
      },
      { status: 500 }
    );
  } finally {
    // Disconnect from the database to prevent connection pool issues
    await db.$disconnect();
  }
}
