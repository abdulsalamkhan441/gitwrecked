import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

function formatZrange(rawList: any[]): { username: string; score: number }[] {
  if (!Array.isArray(rawList)) return [];
  const result = [];
  for (let i = 0; i < rawList.length; i += 2) {
    if (rawList[i] !== undefined) {
      result.push({
        username: String(rawList[i]),
        score: Number(rawList[i + 1] || 0),
      });
    }
  }
  return result;
}

export async function GET() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ entries: [] });
  }

  try {
    const rawLeaderboard = await kv.zrange('leaderboard', 0, 9, { withScores: true, rev: true });
    const entries = formatZrange(rawLeaderboard || []);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ entries: [] });
  }
}