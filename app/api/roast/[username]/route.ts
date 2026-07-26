import { NextRequest, NextResponse } from 'next/server';
import { generateRoast, RoastIntensity } from '@/app/utils/roastEngine';
import { generateBadges } from '@/app/utils/badges';
import { kv } from '@vercel/kv';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const searchParams = request.nextUrl.searchParams;
    const mode = (searchParams.get('mode') === 'deep-fried' ? 'deep-fried' : 'mild') as RoastIntensity;

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitWrecked-App',
      },
      next: { revalidate: 60 },
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ error: `GitHub user "${username}" not found.` }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch data from GitHub API.' }, { status: userRes.status });
    }

    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitWrecked-App',
      },
      next: { revalidate: 60 },
    });

    const repos = reposRes.ok ? await reposRes.json() : [];

    const report = generateRoast(user, repos, mode);

    const badges = typeof generateBadges === 'function' ? generateBadges(user, repos, report) : [];

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const pipeline = kv.pipeline();

        pipeline.zadd('leaderboard', { score: report.uselessnessScore, member: user.login });

        if (report.totalStars === 0 || !report.totalStars) {
          pipeline.zadd('starless', { score: user.public_repos || 1, member: user.login });
        }

        const ratio = Math.max(1, Math.floor((user.following / Math.max(1, user.followers)) * 10));
        pipeline.zadd('worstRatio', { score: ratio, member: user.login });

        const feedEntry = {
          username: user.login,
          punchline: (report.roastText || 'Got roasted on GitWrecked').slice(0, 120) + '...',
          ts: Date.now(),
        };
        pipeline.lpush('feed', JSON.stringify(feedEntry));
        pipeline.ltrim('feed', 0, 99);

        await pipeline.exec();
      } catch (kvErr) {
        console.error('KV Storage Error:', kvErr);
      }
    }

    return NextResponse.json(
      {
        user,
        report,
        badges,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong while generating the roast.' },
      { status: 500 }
    );
  }
}