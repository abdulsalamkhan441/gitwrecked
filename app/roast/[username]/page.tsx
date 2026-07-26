'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { GitHubUserData, RoastReport, RoastIntensity } from '@/app/utils/roastEngine';
import { Badge } from '@/app/utils/badges';
import { playSound } from '@/app/utils/sounds';
import AmbientBackground from '@/app/components/AmbientBackground';
import GlassPanel from '@/app/components/GlassPanel';
import DamageMeter from '@/app/components/DamageMeter';
import RoastCard from '@/app/components/RoastCard';
import ExcuseButtons from '@/app/components/ExcuseButtons';
import { useNarrator } from '@/app/utils/useNarrator';

const GRADE_COLORS: Record<string, string> = {
  S: 'text-[#3FB950] border-[#3FB950]',
  A: 'text-[#3FB950] border-[#3FB950]',
  B: 'text-[#D29922] border-[#D29922]',
  C: 'text-[#D29922] border-[#D29922]',
  D: 'text-[#F85149] border-[#F85149]',
  F: 'text-[#F85149] border-[#F85149]',
};

export const dynamicParams = true;

export default function RoastReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = params?.username as string;
  const intensity = (searchParams.get('mode') === 'deep-fried' ? 'deep-fried' : 'mild') as RoastIntensity;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<{ user: GitHubUserData; report: RoastReport } | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const { speak, stop, speaking } = useNarrator();

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);
        setBadges([]);
        const res = await fetch(`/api/roast/${username}?mode=${intensity}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to generate roast');
        }
        const result = await res.json();

        const payload = result.data && typeof result.data === 'object' ? result.data : result;

        if (!payload || typeof payload.user !== 'object' || payload.user === null) {
          throw new Error('The user data from the server was invalid. Please try again.');
        }
        if (!payload.report) {
          throw new Error('The roast report from the server was missing. Please try again.');
        }

        if (cancelled) return; 

        setData({ user: payload.user, report: payload.report });
        setBadges(payload.badges || []);
      } catch (err: any) {
        if (cancelled || err?.name === 'AbortError') return;
        setError(err.message || 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [username, intensity]);

  useEffect(() => {
    if (!data) return;
    const openingSounds = ['holyjesusO', 'eewO', 'mydisappO', 'oyowtfO', 'youbrokeO', 'emotionalO', 'indianO', 'laidesO', 'imeanO'];
    const randomSound = openingSounds[Math.floor(Math.random() * openingSounds.length)];
    playSound(randomSound as Parameters<typeof playSound>[0]);
    const t = setTimeout(() => speak(data.report.roastText), 900);
    return () => { clearTimeout(t); stop(); };
  }, [data]);

  const handleCopy = () => {
    if (!data) return;
    const shareSounds = ['wedontS', 'waitaS', 'stopitS', 'wedonotS'];
    const randomSound = shareSounds[Math.floor(Math.random() * shareSounds.length)];
    playSound(randomSound as Parameters<typeof playSound>[0]);
    navigator.clipboard.writeText(
      `GitWrecked review of @${data.user.login} (grade: ${data.report.grade})\n\n${data.report.roastText}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRoastAgain = () => {
    const roastAgainSounds = ['ooupniR', 'idontR'];
    const randomSound = roastAgainSounds[Math.floor(Math.random() * roastAgainSounds.length)];
    playSound(randomSound as Parameters<typeof playSound>[0]);
    stop();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-[#6E7681] px-4">
        <AmbientBackground />
        <p>
          $ analyzing @{username}
          <span className="animate-pulse">_</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-mono">
        <AmbientBackground />
        <GlassPanel className="max-w-md w-full p-6">
          <p className="text-[#F85149] font-bold mb-2">✕ build failed</p>
          <p className="text-sm mb-5">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-sm rounded-lg border border-white/10 px-4 py-2 hover:border-[#F85149] transition-colors"
          >
            ← try another username
          </button>
        </GlassPanel>
      </div>
    );
  }

  if (!data) return null;
  const { user, report } = data;

  return (
    <div className="min-h-screen font-mono text-[#E6E8EB] px-4 py-10">
      <AmbientBackground />
      <div className="max-w-2xl mx-auto space-y-4">
        <p className="text-[#6E7681] text-sm">
          $ gitwrecked review @{user.login} --mode={report.intensity}
        </p>

        <GlassPanel className="p-6 flex items-start gap-4">
          <img src={user.avatar_url} alt={user.login} className="w-16 h-16 rounded-full border border-white/10" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{user.name || user.login}</h2>
            <p className="text-[#6E7681] text-sm mb-2">@{user.login}</p>
            <p className="text-sm text-[#E6E8EB]/80">{user.bio || '— no bio —'}</p>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {badges.map((b) => (
                  <span
                    key={b.id}
                    className="text-xs rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                  >
                    {b.emoji} {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div
            className={`shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xl ${GRADE_COLORS[report.grade]}`}
          >
            {report.grade}
          </div>
        </GlassPanel>

        <GlassPanel className="px-6 py-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <span>
            <span className="text-[#6E7681]">repos</span> <span className="font-bold">{user.public_repos}</span>
          </span>
          <span>
            <span className="text-[#3FB950]">+{user.followers}</span>{' '}
            <span className="text-[#6E7681]">followers</span>
          </span>
          <span>
            <span className="text-[#F85149]">-{user.following}</span>{' '}
            <span className="text-[#6E7681]">following</span>
          </span>
          <span>
            <span className="text-[#6E7681]">stars</span> <span className="font-bold">{report.totalStars}</span>
          </span>
        </GlassPanel>

        <GlassPanel className="p-4">
          <DamageMeter score={report.uselessnessScore} intensity={report.intensity} />
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#6E7681] text-xs">// the roast</p>
            <button
              onClick={() => (speaking ? stop() : speak(report.roastText))}
              className="text-xs text-[#6E7681] hover:text-[#E6E8EB] transition-colors"
            >
              {speaking ? '⏸ stop narration' : '▶ read it aloud'}
            </button>
          </div>
          <p className="text-[15px] leading-relaxed text-[#E6E8EB]/95">{report.roastText}</p>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-bold text-sm mb-3 text-[#3FB950]">how to improve</h3>
          <ul className="space-y-2">
            {report.points.map((p) => (
              <li key={p.id + '-tip'} className="text-sm text-[#E6E8EB]/80 flex gap-2">
                <span className="text-[#3FB950] shrink-0">→</span>
                {p.tip}
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-bold text-sm mb-3 text-[#6E7681]">how we scored this</h3>
          <div className="space-y-1.5">
            {report.points.map((p) => (
              <div key={p.id + '-pt'} className="flex justify-between text-xs text-[#E6E8EB]/70">
                <span className="capitalize">{p.id.replace(/-/g, ' ')}</span>
                <span>
                  +{p.severity} pt{p.severity > 1 ? 's' : ''}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/10 mt-2">
              <span>total → normalized</span>
              <span className="text-[#F85149]">
                {report.score} pts → {report.uselessnessScore}/100
              </span>
            </div>
          </div>
        </GlassPanel>

        <div className="flex items-center justify-center py-4">
          <div
            className={`border-2 rounded px-4 py-2 -rotate-6 font-bold tracking-widest text-sm ${GRADE_COLORS[report.grade]}`}
          >
            CHANGES REQUESTED
          </div>
        </div>

        <GlassPanel className="p-5">
          <ExcuseButtons />
        </GlassPanel>

        <GlassPanel className="p-5 flex flex-col items-center gap-3">
          <p className="text-xs text-[#6E7681]">shareable receipt</p>
          <RoastCard user={user} report={report} badges={badges} />
        </GlassPanel>

        <div className="flex flex-wrap gap-3 justify-center pb-8">
          <button
            onClick={handleCopy}
            className="text-sm rounded-lg border border-white/10 px-4 py-2 hover:border-[#3FB950] transition-colors"
          >
            {copied ? '✓ copied' : 'copy roast'}
          </button>
          <button
            onClick={() => router.push('/#leaderboard')}
            className="text-sm rounded-lg border border-white/10 px-4 py-2 hover:border-[#D29922] transition-colors"
          >
            see leaderboard
          </button>
          <button
            onClick={handleRoastAgain}
            className="text-sm rounded-lg border border-white/10 px-4 py-2 hover:border-[#F85149] transition-colors"
          >
            roast someone else
          </button>
        </div>
      </div>
    </div>
  );
}