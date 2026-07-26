'use client';

import { useState } from 'react';
import { playSound } from '@/app/utils/sounds';

const EXCUSES = [
  { text: 'My best code is in private repos!', comeback: "Sure it is, buddy. Sure it is." },
  { text: 'I was trapped in tutorial hell!', comeback: 'For how long, three years?' },
  { text: "I don't have time to open source!", comeback: 'You have time to argue with an app about it though.' },
  { text: 'Quality over quantity!', comeback: 'Okay, so where\'s the quality.' },
];

export default function ExcuseButtons() {
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = (comeback: string) => {
    playSound('counterBurn');
    setToast(comeback);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="relative">
      <p className="font-mono text-xs text-[#6E7681] mb-2 text-center">got a defense?</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {EXCUSES.map((e) => (
          <button
            key={e.text}
            onClick={() => handleClick(e.comeback)}
            className="text-xs rounded-full border border-white/10 px-3 py-1.5 hover:border-[#F85149] transition-colors"
          >
            {e.text}
          </button>
        ))}
      </div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg border border-[#F85149]/40 bg-[#12161D]/95 backdrop-blur px-4 py-2.5 text-sm font-mono shadow-xl animate-[fadeIn_0.2s_ease]">
          {toast}
        </div>
      )}
    </div>
  );
}