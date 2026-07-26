import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { z } from 'zod';

const feedEntrySchema = z.object({
  username: z.string(),
  punchline: z.string(),
  ts: z.number(),
});

function formatZrange(rawList: any[]): { username: string; score: number }[] {
  if (!Array.isArray(rawList)) return [];

  if (rawList.length > 0 && typeof rawList[0] === 'object' && rawList[0] !== null) {
    return rawList.map((item) => ({
      username: String(item.member || item.value || item.username || 'unknown'),
      score: Number(item.score || 0),
    }));
  }

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
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return NextResponse.json({ starless: [], worstRatio: [], recentFeed: [] });
  }

  try {
    const [rawStarless, rawWorstRatio, rawFeed] = await Promise.all([
      kv.zrange('starless', 0, 4, { withScores: true, rev: true }),
      kv.zrange('worstRatio', 0, 4, { withScores: true, rev: true }),
      kv.lrange('feed', 0, 4),
    ]);

    const starless = formatZrange(rawStarless || []);
    const worstRatio = formatZrange(rawWorstRatio || []);

    const recentFeed = (rawFeed || [])
      .map((entry) => {
        try {
          return feedEntrySchema.parse(typeof entry === 'string' ? JSON.parse(entry) : entry);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ starless, worstRatio, recentFeed });
  } catch (error) {
    console.error('Hall of Shame GET error:', error);
    return NextResponse.json({ starless: [], worstRatio: [], recentFeed: [] });
  }
}