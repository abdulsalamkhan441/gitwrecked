'use client';

import { useEffect, useState } from 'react';
import { RoastIntensity } from '@/app/utils/roastEngine';

export default function DamageMeter({ score, intensity }: { score: number; intensity: RoastIntensity }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = 70;
  const circumference = Math.PI * radius;  
  const offset = circumference - (animated / 100) * circumference;

  const label = intensity === 'deep-fried' ? 'Critical Emotional Damage' : 'Recruiter Disappointment Index';
  const color = animated > 66 ? '#F85149' : animated > 33 ? '#D29922' : '#3FB950';

  return (
    <div className="flex flex-col items-center py-2">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 10 90 A 70 70 0 0 1 170 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1), stroke 1.1s ease' }}
        />
        <text x="90" y="82" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#E6E8EB" fontFamily="monospace">
          {animated}%
        </text>
      </svg>
      <p className="font-mono text-xs text-[#6E7681] mt-1 text-center">{label}</p>
      {intensity === 'mild' && (
        <p className="font-mono text-[10px] text-[#6E7681]/70 mt-0.5">
          est. salary reduction: -{Math.round(score * 0.4)}%
        </p>
      )}
    </div>
  );
}