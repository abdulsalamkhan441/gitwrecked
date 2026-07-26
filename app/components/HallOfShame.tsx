'use client';

import { useEffect, useState } from 'react';
import GlassPanel from '@/app/components/GlassPanel';

interface LeaderboardEntry {
  username: string;
  score: number;
}

interface FeedEntry {
  username: string;
  punchline: string;
  ts: number;
}

interface HallOfShameData {
  starless: LeaderboardEntry[];
  worstRatio: LeaderboardEntry[];
  recentFeed: FeedEntry[];
}

export default function HallOfShame() {
  const [hallOfShame, setHallOfShame] = useState<HallOfShameData>({
    starless: [],
    worstRatio: [],
    recentFeed: [],
  });

  const loadHallOfShame = async () => {
    try {
      const res = await fetch('/api/hall-of-shame');
      const json = await res.json();
      setHallOfShame({
        starless: json.starless || [],
        worstRatio: json.worstRatio || [],
        recentFeed: json.recentFeed || [],
      });
    } catch {
      
    }
  };

  useEffect(() => {
    loadHallOfShame();
  }, []);

  return (
    <section className="px-6 py-16 border-t border-white/10">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-[#6E7681] text-xs mb-1 text-center">$ hall --of-shame</p>
        <h2 className="font-mono text-xl font-bold mb-6 text-center">hall of shame</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <GlassPanel className="p-5">
            <h3 className="font-mono font-bold text-sm mb-3 text-[#F85149]">most starless</h3>
            {hallOfShame.starless.length === 0 && <p className="text-xs font-mono text-[#6E7681]">nobody qualifies yet</p>}
            {hallOfShame.starless.map((e, i) => (<div key={e.username} className="flex justify-between text-xs font-mono py-1.5 border-b border-white/5 last:border-0"><span>#{i + 1} @{e.username}</span><span className="text-[#6E7681]">{e.score} repos</span></div>))}
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="font-mono font-bold text-sm mb-3 text-[#D29922]">worst follow ratio</h3>
            {hallOfShame.worstRatio.length === 0 && <p className="text-xs font-mono text-[#6E7681]">nobody qualifies yet</p>}
            {hallOfShame.worstRatio.map((e, i) => (<div key={e.username} className="flex justify-between text-xs font-mono py-1.5 border-b border-white/5 last:border-0"><span>#{i + 1} @{e.username}</span><span className="text-[#6E7681]">{(e.score / 10).toFixed(1)}x</span></div>))}
          </GlassPanel>
        </div>

        <GlassPanel className="mt-6 p-5">
          <h3 className="font-mono font-bold text-sm mb-3 text-[#6E7681]">recent live roasts</h3>
          {hallOfShame.recentFeed.length === 0 && <p className="text-xs font-mono text-[#6E7681]">no roasts yet — go start one</p>}
          {hallOfShame.recentFeed.map((f, i) => (<p key={i} className="text-xs font-mono py-2 border-b border-white/5 last:border-0 text-[#E6E8EB]/70">@{f.username}: "{f.punchline.slice(0, 90)}{f.punchline.length > 90 ? '…' : ''}"</p>))}
        </GlassPanel>
      </div>
    </section>
  );
}