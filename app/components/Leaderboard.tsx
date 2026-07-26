'use client';

import { useEffect, useState } from 'react';
import GlassPanel from '@/app/components/GlassPanel';

interface LeaderboardEntry {
  username: string;
  score: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);

  const loadLeaderboard = async () => {
    setBoardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const json = await res.json();
      setEntries(json.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`);

  return (
    <section id="leaderboard" className="px-6 py-16 border-t border-white/10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-mono text-[#6E7681] text-xs mb-1">$ rank --by uselessness</p>
            <h2 className="font-mono text-xl font-bold">most useless leaderboard</h2>
          </div>
          <button onClick={loadLeaderboard} className="text-xs font-mono text-[#6E7681] hover:text-[#E6E8EB] transition-colors">
            refresh
          </button>
        </div>

        <GlassPanel className="divide-y divide-white/10">
          {boardLoading && <p className="p-6 text-sm font-mono text-[#6E7681]">$ loading rankings...</p>}
          {!boardLoading && entries.length === 0 && <p className="p-6 text-sm font-mono text-[#6E7681]">No roasts recorded yet — be the first.</p>}
          {entries.map((e, i) => (
            <div key={e.username} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3"><span className="text-sm w-8 font-mono text-[#6E7681]">{medal(i)}</span><span className="text-sm font-mono font-bold">@{e.username}</span></div><span className="text-sm font-mono text-[#F85149] font-bold">{e.score}/100</span>
            </div>
          ))}
        </GlassPanel>
      </div>
    </section>
  );
}